import requests
import json
import base64
import time
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger(__name__)

# Chapa API configuration
CHAPA_SECRET_KEY = "CHASECK_TEST-dtqf3YNyIqNH7hrExjwTf2g26XHDsdfO"
CHAPA_ENCRYPTION_KEY = "9VlQoCLgY96HB05wNui6pK6y"

def decrypt_data(encrypted_data, encryption_key):
    """Decrypt data that was encrypted with the given key"""
    try:
        # Pad the encryption key to 32 bytes for Fernet
        padded_key = encryption_key.ljust(32)[:32].encode()
        
        # Create a Fernet key from the padded encryption key
        key = base64.urlsafe_b64encode(padded_key)
        cipher = Fernet(key)
        
        # Decode the encrypted data
        if isinstance(encrypted_data, str):
            # If it's base64 encoded, add padding if needed
            padding = 4 - (len(encrypted_data) % 4)
            if padding < 4:
                encrypted_data += "=" * padding
            
            # Convert to bytes
            encrypted_bytes = base64.b64decode(encrypted_data)
        else:
            encrypted_bytes = encrypted_data
            
        # Decrypt the data
        decrypted_bytes = cipher.decrypt(encrypted_bytes)
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Error decrypting data: {e}")
        return None

def process_withdrawal(withdrawal_request):
    """Process a withdrawal request using Chapa API"""
    try:
        # Extract necessary information from the withdrawal request
        amount = withdrawal_request.get('amount')
        
        # Get bank details from the new structure
        bank_details = withdrawal_request.get('bankDetails', {})
        encrypted_details = withdrawal_request.get('encryptedDetails', {})
        
        # Get account information based on the provided structure
        # For fullName instead of accountName
        account_name = bank_details.get('fullName')
        account_number = bank_details.get('accountNumber')
        
        # If account details are not in bankDetails, check encryptedDetails
        if not account_name and encrypted_details.get('fullName'):
            account_name = decrypt_data(encrypted_details.get('fullName'), CHAPA_ENCRYPTION_KEY)
        
        if not account_number and encrypted_details.get('accountNumber'):
            account_number = decrypt_data(encrypted_details.get('accountNumber'), CHAPA_ENCRYPTION_KEY)
        
        # Get payment method from encrypted details
        method = encrypted_details.get('method', 'cbe')  # Default to CBE if not specified
        
        # Validate account number format based on method
        if not validate_account_number(account_number, method):
            return {
                'success': False,
                'message': 'Invalid account number for the selected bank or mobile wallet type.',
                'status': 'failed',
                'data': None
            }
        
        # Map method to bank code
        bank_code = get_bank_code(method)
        
        # Generate a unique reference
        reference = f"WD-{withdrawal_request.get('id', '')}-{int(time.time())}"
        if withdrawal_request.get('chapaResponse', {}).get('data'):
            # Use existing reference if available
            reference = withdrawal_request.get('chapaResponse').get('data')
        
        # Log the extracted data
        logger.info(f"Processing withdrawal: amount={amount}, account_name={account_name}, account_number={account_number}, method={method}")
        
        # Prepare the payload for Chapa API
        url = "https://api.chapa.co/v1/transfers"
        payload = {
            "account_name": account_name,
            "account_number": account_number,
            "amount": str(amount),
            "currency": "ETB",
            "reference": reference,
            "bank_code": bank_code
        }
        
        headers = {
            'Authorization': f'Bearer {CHAPA_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Log the payload being sent to Chapa
        logger.info(f"Sending to Chapa API: {payload}")
        
        # Make the API call
        response = requests.post(url, json=payload, headers=headers)
        
        # Parse and return the response
        if response.status_code in (200, 201):
            logger.info(f"Withdrawal successful: {response.text}")
            try:
                response_data = response.json()
                return {
                    'success': True,
                    'data': response_data.get('data'),  # This should be the reference
                    'message': response_data.get('message', 'Transfer Queued Successfully'),
                    'status': response_data.get('status', 'success')
                }
            except Exception as json_error:
                logger.error(f"Error parsing JSON response: {json_error}")
                return {
                    'success': True,
                    'data': reference,
                    'message': 'Transfer Queued Successfully',
                    'status': 'success'
                }
        else:
            logger.error(f"Chapa API error: {response.status_code} - {response.text}")
            try:
                response_data = response.json()
                return {
                    'success': False,
                    'data': None,
                    'message': response_data.get('message', 'Error processing withdrawal'),
                    'status': response_data.get('status', 'failed')
                }
            except Exception:
                return {
                    'success': False,
                    'data': None,
                    'message': f'Error processing withdrawal: {response.text}',
                    'status': 'failed'
                }
    
    except Exception as e:
        logger.error(f"Error processing withdrawal: {e}")
        return {
            'success': False,
            'message': f'Error processing withdrawal: {str(e)}',
            'status': 'failed',
            'data': None
        }

def validate_account_number(account_number, method):
    """Validate account number format based on the payment method"""
    if not account_number:
        return False
        
    # Strip any spaces or special characters
    clean_account = ''.join(c for c in account_number if c.isalnum())
    
    # Method-specific validation
    if method.lower() == 'cbe':
        # CBE account numbers are typically 10-16 digits
        return len(clean_account) >= 10 and len(clean_account) <= 16 and clean_account.isdigit()
    elif method.lower() == 'telebirr':
        # TeleBirr uses phone numbers, should be 9-10 digits
        return len(clean_account) >= 9 and len(clean_account) <= 10 and clean_account.isdigit()
    elif method.lower() in ['dashen', 'abyssinia', 'awash']:
        # Other banks typically have 10-14 digit account numbers
        return len(clean_account) >= 10 and len(clean_account) <= 14 and clean_account.isdigit()
    else:
        # For unknown methods, just check if it's a reasonable length number
        return len(clean_account) >= 8 and len(clean_account) <= 20

def get_bank_code(method):
    """Map payment method to Chapa bank code"""
    bank_codes = {
        'cbe': 656,  # Commercial Bank of Ethiopia
        'dashen': 655,  # Dashen Bank
        'abyssinia': 659,  # Bank of Abyssinia
        'awash': 654,  # Awash Bank
        'telebirr': 660,  # TeleBirr
    }
    
    return bank_codes.get(method.lower(), 656)  # Default to CBE if not found
