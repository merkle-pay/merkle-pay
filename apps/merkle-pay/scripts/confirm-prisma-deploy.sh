#!/bin/bash

# Print the prompt message. 'echo' adds a newline automatically.
echo 'Apply pending migrations to the database?'

# Read the user's input from the next line
read confirm

# Check if the input is exactly "yes"
if [[ "$confirm" == "yesyesyes" ]]; then
  echo "Confirmation received. Applying migrations..."
  # Execute the actual prisma command
  npx prisma migrate deploy
  # Capture the exit code of the prisma command
  exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "Prisma migrate deploy failed."
  fi
  # Exit the script with the same exit code as prisma
  exit $exit_code
else
  # If confirmation is not "yes", cancel
  echo "Migration cancelled."
  # Exit with a non-zero code to indicate cancellation/failure
  exit 1
fi 