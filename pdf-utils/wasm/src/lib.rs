use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use web_sys::console;

/// Initialize the WASM module
/// This function is called when the module is loaded
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn init() {
    // Set panic hook for better error messages in development
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    
    console::log_1(&"Bitcoin PDF Utils WASM module initialized".into());
}

/// Generate a simple greeting message
/// This is a placeholder function demonstrating WASM functionality
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Bitcoin PDF Utils is ready.", name)
}

/// Placeholder for PDF generation functionality
/// Future implementation will handle Bitcoin transaction PDFs
#[wasm_bindgen]
pub fn generate_bitcoin_transaction_pdf(transaction_id: &str) -> Result<String, JsValue> {
    match validate_transaction_id(transaction_id) {
        Ok(()) => Ok(format!("PDF generation requested for transaction: {}", transaction_id)),
        Err(e) => Err(JsValue::from_str(e)),
    }
}

/// Internal validation function that can be tested in native Rust
fn validate_transaction_id(transaction_id: &str) -> Result<(), &'static str> {
    // Security: Validate input to prevent injection attacks
    if transaction_id.is_empty() {
        return Err("Transaction ID cannot be empty");
    }
    
    if transaction_id.len() > 64 {
        return Err("Transaction ID too long");
    }
    
    // Validate that transaction ID contains only valid hex characters
    if !transaction_id.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err("Transaction ID must contain only hexadecimal characters");
    }
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("Alice");
        assert!(result.contains("Alice"));
        assert!(result.contains("Bitcoin PDF Utils"));
    }

    #[test]
    fn test_validate_tx_valid() {
        let result = validate_transaction_id("abc123");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_tx_empty() {
        let result = validate_transaction_id("");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Transaction ID cannot be empty");
    }

    #[test]
    fn test_validate_tx_invalid_chars() {
        let result = validate_transaction_id("invalid<script>");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Transaction ID must contain only hexadecimal characters");
    }

    #[test]
    fn test_validate_tx_too_long() {
        let long_id = "a".repeat(65);
        let result = validate_transaction_id(&long_id);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Transaction ID too long");
    }
}
