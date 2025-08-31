#!/bin/bash

# CryptoSense Dashboard Deployment Script
set -e

echo "🚀 Starting CryptoSense Dashboard Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Functions
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Check environment file
check_environment() {
    print_step "Checking environment configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning "Production environment file not found. Creating from template..."
        cp .env.production.example .env.production 2>/dev/null || true
        print_warning "Please edit .env.production with your configuration"
        return 1
    fi
    
    # Check for required environment variables
    required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE" || grep -q "^$var=$" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables in $ENV_FILE"
        return 1
    fi
    
    print_success "Environment configuration is valid"
}

# Build application
build_application() {
    print_step "Building application..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build new images
    docker-compose build --no-cache
    
    print_success "Application built successfully"
}

# Start services
start_services() {
    print_step "Starting services..."
    
    # Start database and cache first
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_step "Waiting for database to be ready..."
    sleep 10
    
    # Start application
    docker-compose up -d app
    
    # Optional: Start nginx
    if [[ -f "nginx.conf" ]]; then
        docker-compose up -d nginx
    fi
    
    print_success "Services started successfully"
}

# Health check
health_check() {
    print_step "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost:3001/api/market-data/health > /dev/null 2>&1; then
            print_success "Health check passed"
            return 0
        fi
        
        print_warning "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show status
show_status() {
    print_step "Deployment Status:"
    
    echo ""
    echo "Services Status:"
    docker-compose ps
    
    echo ""
    echo "Access URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001"
    echo "  Health Check: http://localhost:3001/api/market-data/health"
    
    if docker-compose ps | grep -q nginx; then
        echo "  Nginx: http://localhost:80"
    fi
    
    echo ""
    echo "Logs:"
    echo "  docker-compose logs -f app"
    echo "  docker-compose logs -f postgres"
    echo "  docker-compose logs -f redis"
}

# Cleanup on failure
cleanup() {
    print_error "Deployment failed. Cleaning up..."
    docker-compose down 2>/dev/null || true
    exit 1
}

# Main deployment process
main() {
    trap cleanup ERR
    
    check_dependencies
    
    if ! check_environment; then
        exit 1
    fi
    
    build_application
    start_services
    
    if health_check; then
        show_status
        print_success "🎉 CryptoSense Dashboard deployed successfully!"
    else
        print_error "Deployment completed but health check failed"
        docker-compose logs app
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "build")
        build_application
        ;;
    "start")
        start_services
        ;;
    "stop")
        print_step "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_step "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        show_status
        ;;
    "clean")
        print_step "Cleaning up..."
        docker-compose down -v --rmi all
        print_success "Cleanup completed"
        ;;
    *)
        main
        ;;
esac