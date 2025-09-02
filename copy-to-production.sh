#!/bin/bash

echo "🚀 Task Manager - Production Data Setup Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Checking local data files...${NC}"

# Check if users.json exists
if [ -f "backend/users.json" ]; then
    USER_COUNT=$(jq length backend/users.json 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ users.json found with $USER_COUNT users${NC}"
else
    echo -e "${RED}❌ users.json not found${NC}"
    exit 1
fi

# Check if tasks.json exists
if [ -f "backend/tasks.json" ]; then
    TASK_COUNT=$(jq length backend/tasks.json 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ tasks.json found with $TASK_COUNT tasks${NC}"
else
    echo -e "${RED}❌ tasks.json not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Production Environment Setup:${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}1. Go to Render Dashboard:${NC}"
echo "   https://dashboard.render.com"
echo ""
echo -e "${BLUE}2. Click on your service:${NC}"
echo "   task-manager-2ejf"
echo ""
echo -e "${BLUE}3. Go to 'Environment' tab${NC}"
echo ""
echo -e "${BLUE}4. Add these environment variables:${NC}"
echo ""
echo -e "${GREEN}   NODE_ENV = production${NC}"
echo -e "${GREEN}   SESSION_SECRET = task-manager-secret-2024-production-secure${NC}"
echo -e "${GREEN}   DATA_DIR = /opt/render/project/src/backend${NC}"
echo -e "${GREEN}   PORT = 10000${NC}"
echo ""
echo -e "${BLUE}5. Click 'Save Changes'${NC}"
echo ""
echo -e "${BLUE}6. Redeploy your service${NC}"
echo ""

echo -e "${YELLOW}📋 Data Files Summary:${NC}"
echo "================================"
echo -e "Users: ${GREEN}$USER_COUNT${NC}"
echo -e "Tasks: ${GREEN}$TASK_COUNT${NC}"
echo ""

echo -e "${YELLOW}🧪 Testing Commands:${NC}"
echo "============================="
echo ""
echo -e "${BLUE}After deployment, test these endpoints:${NC}"
echo ""
echo -e "${GREEN}Health Check:${NC}"
echo "curl https://task-manager-2ejf.onrender.com/health"
echo ""
echo -e "${GREEN}Session Test:${NC}"
echo "curl https://task-manager-2ejf.onrender.com/api/test-session"
echo ""
echo -e "${GREEN}Login Test:${NC}"
echo "curl -X POST https://task-manager-2ejf.onrender.com/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"emailAddress\":\"test2@example.com\",\"password\":\"password123\"}'"
echo ""

echo -e "${GREEN}✅ Setup complete! Follow the steps above to configure Render.${NC}"
echo ""
echo -e "${BLUE}💡 Pro tip: After setting environment variables, redeploy your service${NC}"
echo -e "${BLUE}   and the health endpoint will show if your data files are accessible.${NC}"
