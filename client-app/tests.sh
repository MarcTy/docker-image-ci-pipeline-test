#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to handle errors
error_exit() {
    echo "Error: $1"
    exit 1
}

# Run tests
npm run test:ci || error_exit "Tests failed."

# Display completion.
echo "Tests completed successfully."