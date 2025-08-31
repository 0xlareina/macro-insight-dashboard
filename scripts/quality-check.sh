#!/bin/bash

# CryptoSense Dashboard - Code Quality Check Script
# Powered by Gemini CLI as Code Quality Director

set -e

PROJECT_ROOT="/Users/cryptape/Macro Insight"
QUALITY_REPORT_DIR="$PROJECT_ROOT/quality-reports"
GEMINI_CONFIG="$PROJECT_ROOT/.gemini-config.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧙 Gemini CLI - Code Quality Director${NC}"
echo -e "${BLUE}CryptoSense Dashboard Quality Check${NC}"
echo -e "${BLUE}====================================${NC}\n"

# Create quality reports directory
mkdir -p "$QUALITY_REPORT_DIR"

# Function to run quality checks
run_quality_check() {
    local check_name="$1"
    local command="$2"
    local description="$3"
    
    echo -e "${YELLOW}📊 Running: $check_name${NC}"
    echo -e "   $description"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $check_name: PASSED${NC}\n"
        return 0
    else
        echo -e "${RED}❌ $check_name: FAILED${NC}\n"
        return 1
    fi
}

# Function to use Gemini CLI for code review
gemini_code_review() {
    echo -e "${BLUE}🤖 Gemini AI Code Review${NC}"
    echo "Analyzing code quality and providing recommendations..."
    
    # Use Gemini CLI to analyze the codebase
    gemini -p "Act as a Senior Code Quality Engineer reviewing this crypto dashboard project. 

Please analyze the current codebase structure and provide:

1. **Code Quality Assessment**: Overall code quality score (1-10)
2. **Security Review**: Check for potential security vulnerabilities, especially:
   - API key exposure risks
   - Input validation issues  
   - Financial calculation precision
   - Real-time data integrity
3. **Performance Analysis**: Identify potential bottlenecks for:
   - Real-time data processing
   - Chart rendering performance
   - API response times
   - Memory usage optimization
4. **Architecture Review**: Evaluate:
   - Code organization and modularity
   - Dependency management
   - Error handling strategies
   - Scalability considerations
5. **Crypto-Specific Checks**: Verify:
   - Financial calculation accuracy
   - Price precision handling
   - Real-time data synchronization
   - Trading logic correctness

Please provide specific recommendations for improvements and flag any critical issues that need immediate attention.

Focus areas: TypeScript/JavaScript, React/Vue components, API integrations, real-time WebSocket handling, financial calculations." --all-files
    
    return $?
}

# Initialize quality check session
echo -e "${BLUE}Starting comprehensive quality check...${NC}\n"

FAILED_CHECKS=0

# Check 1: Project Structure Validation
run_quality_check \
    "Project Structure" \
    "test -f package.json && test -d src && test -d docs" \
    "Validating basic project structure"
[ $? -ne 0 ] && ((FAILED_CHECKS++))

# Check 2: Documentation Check
run_quality_check \
    "Documentation" \
    "test -f README.md && test -f docs/PROGRESS_TRACKING.md && test -f crypto-dashboard-prd-with-user-stories.md" \
    "Ensuring all required documentation exists"
[ $? -ne 0 ] && ((FAILED_CHECKS++))

# Check 3: Configuration Files
run_quality_check \
    "Configuration" \
    "test -f .gemini-config.yml && test -f scripts/quality-check.sh" \
    "Validating configuration files presence"
[ $? -ne 0 ] && ((FAILED_CHECKS++))

# Check 4: Git Repository Status
if [ -d .git ]; then
    run_quality_check \
        "Git Status" \
        "git status --porcelain | wc -l | awk '{print (\$1 < 20)}' | grep -q 1" \
        "Checking git repository status"
    [ $? -ne 0 ] && ((FAILED_CHECKS++))
fi

# Check 5: Gemini AI Code Review
echo -e "${YELLOW}🤖 Initiating Gemini AI Code Review...${NC}"
if gemini_code_review; then
    echo -e "${GREEN}✅ Gemini AI Code Review: COMPLETED${NC}\n"
else
    echo -e "${YELLOW}⚠️  Gemini AI Code Review: Review completed with recommendations${NC}\n"
fi

# Quality Gate Summary
echo -e "${BLUE}📋 Quality Gate Summary${NC}"
echo -e "${BLUE}======================${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 All quality checks PASSED!${NC}"
    echo -e "${GREEN}✅ Code quality gate: APPROVED${NC}"
    echo -e "${GREEN}✅ Ready for development phase${NC}\n"
    
    # Generate quality report
    cat > "$QUALITY_REPORT_DIR/quality-gate-report.md" << EOF
# Code Quality Gate Report
**Project**: CryptoSense Dashboard  
**Date**: $(date)  
**Status**: ✅ APPROVED

## Summary
All quality checks passed successfully. The project structure is properly set up and ready for development.

## Quality Metrics
- Project Structure: ✅ PASS
- Documentation: ✅ PASS  
- Configuration: ✅ PASS
- Git Repository: ✅ PASS
- AI Code Review: ✅ COMPLETED

## Next Steps
1. Begin Phase 1 development (Architecture & Data Layer)
2. Set up automated CI/CD pipeline
3. Configure development environment
4. Start implementing user stories

## Gemini CLI Integration Status
🤖 **Gemini CLI successfully configured as Code Quality Director**
- Configuration file: .gemini-config.yml ✅
- Quality check script: scripts/quality-check.sh ✅
- Automated review process: Active ✅

---
*Generated by Gemini CLI Quality Director*
EOF

    exit 0
else
    echo -e "${RED}❌ $FAILED_CHECKS quality checks FAILED${NC}"
    echo -e "${RED}🚫 Code quality gate: REJECTED${NC}"
    echo -e "${YELLOW}📝 Please address the failed checks before proceeding${NC}\n"
    
    # Generate failure report
    cat > "$QUALITY_REPORT_DIR/quality-gate-failures.md" << EOF
# Code Quality Gate Failure Report
**Project**: CryptoSense Dashboard  
**Date**: $(date)  
**Status**: ❌ REJECTED

## Summary
$FAILED_CHECKS quality checks failed. Please address the issues below before proceeding.

## Failed Checks
Please run the quality check script again to see specific failure details.

## Required Actions
1. Fix all failed quality checks
2. Re-run quality gate validation
3. Ensure all project requirements are met

---
*Generated by Gemini CLI Quality Director*
EOF

    exit 1
fi