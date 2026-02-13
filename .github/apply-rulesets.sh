#!/bin/bash
# apply-rulesets.sh
# Script to apply GitHub rulesets to a repository
# Usage: ./apply-rulesets.sh [OWNER] [REPO]

set -e

# Default values
OWNER="${1}"
REPO="${2}"
RULESETS_DIR=".github/rulesets"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "$1"
}

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed. Install it from: https://cli.github.com/"
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        error "Not authenticated with GitHub. Run: gh auth login"
    fi
    
    # Check if rulesets directory exists
    if [ ! -d "$RULESETS_DIR" ]; then
        error "Rulesets directory not found: $RULESETS_DIR"
    fi
    
    # Check if there are any ruleset files
    if ! ls "$RULESETS_DIR"/*.json &> /dev/null; then
        error "No ruleset JSON files found in $RULESETS_DIR"
    fi
    
    success "Prerequisites check passed"
}

# Get repository info
get_repo_info() {
    if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
        info "No repository specified, using current repository..."
        
        # Try to get from gh CLI
        if ! REPO_INFO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null); then
            error "Could not determine repository. Please specify: $0 OWNER REPO"
        fi
        
        OWNER=$(echo "$REPO_INFO" | cut -d'/' -f1)
        REPO=$(echo "$REPO_INFO" | cut -d'/' -f2)
    fi
    
    info "Target repository: $OWNER/$REPO"
    
    # Verify repository access
    if ! gh repo view "$OWNER/$REPO" &> /dev/null; then
        error "Cannot access repository: $OWNER/$REPO"
    fi
    
    # Check if user has admin access
    info "Checking permissions..."
    PERMISSION=$(gh api "/repos/$OWNER/$REPO" -q .permissions.admin)
    if [ "$PERMISSION" != "true" ]; then
        error "You need admin access to $OWNER/$REPO to manage rulesets"
    fi
    
    success "Repository access verified"
}

# Validate rulesets
validate_rulesets() {
    info "Validating rulesets..."
    
    if [ -f ".github/validate-rulesets.py" ]; then
        if ! python3 .github/validate-rulesets.py; then
            error "Ruleset validation failed. Please fix the issues before applying."
        fi
        success "Rulesets validated successfully"
    else
        warning "Validation script not found, skipping validation"
    fi
}

# List existing rulesets
list_existing_rulesets() {
    info "\nChecking for existing rulesets..."
    
    EXISTING=$(gh api "/repos/$OWNER/$REPO/rulesets" 2>/dev/null || echo "[]")
    COUNT=$(echo "$EXISTING" | jq 'length')
    
    if [ "$COUNT" -eq "0" ]; then
        info "No existing rulesets found"
    else
        warning "Found $COUNT existing ruleset(s):"
        echo "$EXISTING" | jq -r '.[] | "  - \(.name) (ID: \(.id), Status: \(.enforcement))"'
        
        read -p "Do you want to continue? This may create duplicates. (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Aborted by user"
            exit 0
        fi
    fi
}

# Apply rulesets
apply_rulesets() {
    info "\nApplying rulesets..."
    
    SUCCESS_COUNT=0
    FAIL_COUNT=0
    
    for ruleset_file in "$RULESETS_DIR"/*.json; do
        RULESET_NAME=$(basename "$ruleset_file")
        info "\nProcessing: $RULESET_NAME"
        
        # Extract ruleset name from file for better error messages
        DISPLAY_NAME=$(jq -r '.name // "Unknown"' "$ruleset_file")
        
        # Try to apply the ruleset
        if gh api --method POST \
            -H "Accept: application/vnd.github+json" \
            "/repos/$OWNER/$REPO/rulesets" \
            --input "$ruleset_file" &> /dev/null; then
            success "Applied: $DISPLAY_NAME"
            ((SUCCESS_COUNT++))
        else
            warning "Failed to apply: $DISPLAY_NAME"
            info "  Note: This may be due to duplicate names or invalid configuration"
            ((FAIL_COUNT++))
        fi
    done
    
    info "\n" + "="*50
    info "Summary:"
    success "Successfully applied: $SUCCESS_COUNT ruleset(s)"
    if [ $FAIL_COUNT -gt 0 ]; then
        warning "Failed to apply: $FAIL_COUNT ruleset(s)"
    fi
}

# Show next steps
show_next_steps() {
    info "\n" + "="*50
    info "Next Steps:"
    info "1. Verify rulesets in GitHub:"
    info "   https://github.com/$OWNER/$REPO/settings/rules"
    info ""
    info "2. Update CODEOWNERS file with your team members"
    info ""
    info "3. Configure GPG signing for all contributors:"
    info "   See: .github/QUICK_START_RULESETS.md"
    info ""
    info "4. Test branch protection by creating a pull request"
    info ""
    info "5. Review security settings:"
    info "   https://github.com/$OWNER/$REPO/settings/security_analysis"
    info ""
    info "For more information, see:"
    info "  - .github/rulesets/README.md"
    info "  - .github/SECURITY_MANAGEMENT.md"
    info "  - .github/QUICK_START_RULESETS.md"
}

# Main execution
main() {
    info "GitHub Rulesets Setup Script"
    info "="*50
    
    check_prerequisites
    get_repo_info
    validate_rulesets
    list_existing_rulesets
    apply_rulesets
    show_next_steps
    
    success "\nSetup complete!"
}

# Run main function
main
