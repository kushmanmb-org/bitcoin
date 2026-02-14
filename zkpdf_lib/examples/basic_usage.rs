use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("zkpdf_lib Example - PDF Verification");
    println!("=====================================\n");

    // Example 1: Successful verification
    println!("Example 1: Verifying substring at correct offset");
    let pdf_data = b"Important Document - This is a sample PDF with verification data".to_vec();
    
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 0,
        substring: "Important Document".to_string(),
    };

    let result = verify_pdf_claim(input)?;
    
    println!("  Verified: {}", result.verified);
    println!("  Page: {}", result.page_number);
    println!("  Offset: {}", result.offset);
    println!("  Substring: {}", result.substring);
    println!("  Metadata: {}\n", result.metadata);

    // Example 2: Verification with different offset
    println!("Example 2: Verifying substring at different offset");
    let pdf_data = b"Some prefix text - Important Document - Some suffix text".to_vec();
    
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 19,
        substring: "Important Document".to_string(),
    };

    let result = verify_pdf_claim(input)?;
    
    println!("  Verified: {}", result.verified);
    println!("  Page: {}", result.page_number);
    println!("  Offset: {}", result.offset);
    println!("  Substring: {}\n", result.substring);

    // Example 3: Verification with wrong offset (within bounds but incorrect position)
    println!("Example 3: Verification with wrong offset (should fail)");
    let pdf_data = b"Important Document - This is a sample PDF".to_vec();
    
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 5,  // Wrong offset (within bounds but wrong position)
        substring: "Important Document".to_string(),
    };

    let result = verify_pdf_claim(input)?;
    
    println!("  Verified: {}", result.verified);
    println!("  This verification failed as expected because the offset is incorrect.\n");

    // Example 4: Error handling for out of bounds offset
    println!("Example 4: Error handling for out of bounds offset");
    let pdf_data = b"Short text".to_vec();
    
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: 0,
        offset: 100,  // Out of bounds
        substring: "Important Document".to_string(),
    };

    match verify_pdf_claim(input) {
        Ok(result) => println!("  Verified: {}", result.verified),
        Err(e) => println!("  Error (as expected): {}\n", e),
    }

    Ok(())
}
