#!/bin/bash

echo "🧪 Task Manager - Production Testing Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PRODUCTION_URL="https://task-manager-2ejf.onrender.com"

echo -e "${BLUE}🔍 Testing production endpoints...${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s "$PRODUCTION_URL/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check successful${NC}"
    echo "Response: $HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi
echo ""

# Test 2: Session Test
echo -e "${YELLOW}2. Testing Session Endpoint...${NC}"
SESSION_RESPONSE=$(curl -s "$PRODUCTION_URL/api/test-session")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Session test successful${NC}"
    echo "Response: $SESSION_RESPONSE" | jq '.' 2>/dev/null || echo "$SESSION_RESPONSE"
else
    echo -e "${RED}❌ Session test failed${NC}"
fi
echo ""

# Test 3: CORS Test
echo -e "${YELLOW}3. Testing CORS...${NC}"
CORS_RESPONSE=$(curl -s -H "Origin: https://task-manager-rho-virid.vercel.app" "$PRODUCTION_URL/api/test-cors")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CORS test successful${NC}"
    echo "Response: $CORS_RESPONSE" | jq '.' 2>/dev/null || echo "$CORS_RESPONSE"
else
    echo -e "${RED}❌ CORS test failed${NC}"
fi
echo ""

# Test 4: Login Test
echo -e "${YELLOW}4. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailAddress":"test2@example.com","password":"password123"}')
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Login test successful${NC}"
    echo "Response: $LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
else
    echo -e "${RED}❌ Login test failed${NC}"
fi
echo ""

echo -e "${BLUE}🎯 Summary:${NC}"
echo "================"
echo ""

# Check if all tests passed
if [[ "$HEALTH_RESPONSE" == *"OK"* ]] && [[ "$SESSION_RESPONSE" == *"Session test endpoint"* ]] && [[ "$LOGIN_RESPONSE" == *"success"* ]]; then
    echo -e "${GREEN}🎉 All tests passed! Your production environment is working!${NC}"
    echo ""
    echo -e "${BLUE}✅ You can now:${NC}"
    echo "   - Login from your Vercel frontend"
    echo "   - Access the dashboard"
    echo "   - Create and manage tasks"
    echo "   - Use all features of your Task Manager"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the responses above.${NC}"
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting:${NC}"
    echo "   - Verify environment variables are set in Render"
    echo "   - Check if service is redeployed"
    echo "   - Look at Render logs for errors"
fi

echo ""
echo -e "${BLUE}🌐 Frontend URL:${NC} https://task-manager-rho-virid.vercel.app"
echo -e "${BLUE}🔧 Backend URL:${NC} $PRODUCTION_URL"
