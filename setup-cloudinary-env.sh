#!/bin/bash

# Cloudinary Environment Variables Setup
# Run this script to set up your Cloudinary credentials

echo "Setting up Cloudinary environment variables..."

# Set individual environment variables
export CLOUDINARY_CLOUD_NAME="dokcs4daz"
export CLOUDINARY_API_KEY="172165474278718"
export CLOUDINARY_API_SECRET="qGhgTVutnXU6C_3MtSZ3XJ2MLTY"

# Set CLOUDINARY_URL for convenience
export CLOUDINARY_URL="cloudinary://172165474278718:qGhgTVutnXU6C_3MtSZ3XJ2MLTY@dokcs4daz"

echo "✅ Cloudinary environment variables set:"
echo "   CLOUDINARY_CLOUD_NAME: $CLOUDINARY_CLOUD_NAME"
echo "   CLOUDINARY_API_KEY: $CLOUDINARY_API_KEY"
echo "   CLOUDINARY_API_SECRET: [HIDDEN]"
echo "   CLOUDINARY_URL: $CLOUDINARY_URL"

echo ""
echo "To make these permanent, add them to your shell profile:"
echo "   echo 'export CLOUDINARY_CLOUD_NAME=\"dokcs4daz\"' >> ~/.zshrc"
echo "   echo 'export CLOUDINARY_API_KEY=\"172165474278718\"' >> ~/.zshrc"
echo "   echo 'export CLOUDINARY_API_SECRET=\"qGhgTVutnXU6C_3MtSZ3XJ2MLTY\"' >> ~/.zshrc"
echo "   echo 'export CLOUDINARY_URL=\"cloudinary://172165474278718:qGhgTVutnXU6C_3MtSZ3XJ2MLTY@dokcs4daz\"' >> ~/.zshrc"
echo ""
echo "Then restart your terminal or run: source ~/.zshrc"
