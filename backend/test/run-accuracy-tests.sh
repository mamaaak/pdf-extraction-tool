#!/bin/bash

# Watershed Plan Extraction Accuracy Testing Suite
# This script runs the complete test suite for watershed plan extraction accuracy

# Ensure we're in the correct directory
cd "$(dirname "$0")"
BASE_DIR="$(pwd)"
TEST_DATA_DIR="$BASE_DIR/data"
RESULTS_DIR="$BASE_DIR/results"

# Create directories if they don't exist
mkdir -p "$TEST_DATA_DIR" "$RESULTS_DIR"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}WATERSHED EXTRACTION TESTING SUITE${NC}"
echo -e "${YELLOW}==================================${NC}"
echo

# Step 1: Check if we need to download sample plans
PDF_COUNT=$(find "$TEST_DATA_DIR" -name "*.pdf" | wc -l)
if [ "$PDF_COUNT" -lt 3 ]; then
  echo -e "${YELLOW}Step 1: Downloading sample watershed plans${NC}"
  node "$BASE_DIR/accuracy/downloadSamplePlans.js"
else
  echo -e "${GREEN}Step 1: Found $PDF_COUNT sample plans in test/data directory${NC}"
  echo "Skipping download step. Use --download if you want to check for new plans."
fi
echo

# Step 2: Check if we need to generate ground truth data
GROUND_TRUTH_COUNT=$(find "$TEST_DATA_DIR/ground-truth" -name "*.json" 2>/dev/null | wc -l)
if [ "$GROUND_TRUTH_COUNT" -lt 2 ] && [ "$PDF_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}Step 2: Ground truth data incomplete${NC}"
  echo "Found $GROUND_TRUTH_COUNT ground truth files but $PDF_COUNT test PDFs."
  echo "Consider generating ground truth data for accurate testing:"
  echo 
  echo "   For each PDF file, run:"
  echo "   node $BASE_DIR/accuracy/generateGroundTruth.js <pdf-filename>"
  echo
  echo "Proceeding with available ground truth data..."
else
  echo -e "${GREEN}Step 2: Found $GROUND_TRUTH_COUNT ground truth files${NC}"
fi
echo

# Step 3: Run accuracy tests
echo -e "${YELLOW}Step 3: Running extraction accuracy tests${NC}"
VERBOSE=""
if [[ "$*" == *"--verbose"* ]]; then
  VERBOSE="--verbose"
fi

node "$BASE_DIR/accuracy/watershedAccuracyTest.js" $VERBOSE

# Step 4: Show results summary
echo -e "${YELLOW}Step 4: Generating test report${NC}"
LATEST_RESULT=$(find "$RESULTS_DIR" -name "summary-*.json" -type f -exec ls -t {} \; | head -1)

if [ -n "$LATEST_RESULT" ]; then
  echo -e "${GREEN}Latest test results: ${LATEST_RESULT}${NC}"
  # You could add here code to generate a markdown report or HTML report from the JSON
  echo "To view detailed results, open this file."
else
  echo -e "${RED}No test results found.${NC}"
fi

echo
echo -e "${GREEN}Testing completed.${NC}"