#!/bin/bash
echo "🚀 Deploying..."
git reset --hard origin/main
echo "✅ Fixing case sensitivity..."
cd dist
cp models/User.model.js models/user.model.js 2>/dev/null
cp common/enums/UserRole.enum.js common/enums/userRole.enum.js 2>/dev/null
cp common/enums/HttpStatus.enum.js common/enums/httpStatus.enum.js 2>/dev/null
cp common/errors/AppError.js common/errors/appError.js 2>/dev/null
cp common/errors/ErrorHandler.js common/errors/errorHandler.js 2>/dev/null
cp common/response/ApiResponse.js common/response/apiResponse.js 2>/dev/null
cp common/repository/BaseRepository.js common/repository/baseRepository.js 2>/dev/null
cd ..
pm2 restart salon-backend --update-env
echo "🎉 Done!"
