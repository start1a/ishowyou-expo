#!/bin/bash
#
# Android Fast Install Script with Build Caching
# 📦 Script to avoid redundant Gradle builds by fingerprinting native configs.
#

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Configuration
CACHE_DIR=".build_cache/android"
BUILD_GRADLE="android/app/build.gradle"
APK_OUTPUT_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
ENV_LOCAL=".env.local"
PACKAGE_NAME="com.hglee.ishowyouexpo"

mkdir -p "$CACHE_DIR"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📱 Android Fast Install (Cached)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# ============================================
# 1단계: 지문(Fingerprint) 계산
# ============================================
echo -e "${BLUE}🔍 Native 설정 변경 확인 중...${NC}"

# 파일 존재 여부 확인 후 hash 계산
FILES_TO_HASH=("package.json" "yarn.lock" "app.json" "google-services.json" "$BUILD_GRADLE")
HASH_INPUT=""
for file in "${FILES_TO_HASH[@]}"; do
    if [ -f "$file" ]; then
        HASH_INPUT+=$(shasum -a 256 "$file" | awk '{print $1}')
    fi
done

FINGERPRINT=$(echo -n "$HASH_INPUT" | shasum -a 256 | awk '{print $1}')
CACHED_APK="${CACHE_DIR}/${FINGERPRINT}.apk"

# ============================================
# 2단계: 캐시 확인 및 빌드
# ============================================
if [ -f "$CACHED_APK" ]; then
    echo -e "${GREEN}✅ 캐시된 빌드 발견! (Fingerprint: ${FINGERPRINT:0:8})${NC}"
else
    echo -e "${YELLOW}⚠️  변경사항이 감지되었거나 캐시가 없습니다. 빌드를 시작합니다.${NC}\n"

    # 버전 정보 가져오기
    CURRENT_VERSION_CODE=$(grep 'versionCode' "$BUILD_GRADLE" | grep -o '[0-9]\+' | head -1)
    CURRENT_VERSION_NAME=$(grep 'versionName' "$BUILD_GRADLE" | grep -o '"[^"]*"' | head -1 | tr -d '"')

    echo -e "${BLUE}현재 버전 정보:${NC}"
    echo -e "  Version Name: ${GREEN}${CURRENT_VERSION_NAME}${NC}"
    echo -e "  Version Code: ${GREEN}${CURRENT_VERSION_CODE}${NC}\n"

    # 버전 정보 입력
    read -p "Version Name (현재: ${CURRENT_VERSION_NAME}, Enter=유지): " INPUT_VERSION_NAME
    NEW_VERSION_NAME="${INPUT_VERSION_NAME:-$CURRENT_VERSION_NAME}"

    read -p "Version Code (현재: ${CURRENT_VERSION_CODE}, Enter=자동증가): " INPUT_VERSION_CODE
    NEW_VERSION_CODE="${INPUT_VERSION_CODE:-$((CURRENT_VERSION_CODE + 1))}"

    echo -e "→ New Version: ${GREEN}${NEW_VERSION_NAME} (${NEW_VERSION_CODE})${NC}"

    # Metro 서버 설정
    METRO_HOST="localhost"
    METRO_PORT="8081"
    if [ -f "$ENV_LOCAL" ]; then
        SAVED_HOST=$(grep "^METRO_HOST=" "$ENV_LOCAL" | cut -d'=' -f2)
        SAVED_PORT=$(grep "^METRO_PORT=" "$ENV_LOCAL" | cut -d'=' -f2)
        [ -n "$SAVED_HOST" ] && METRO_HOST="$SAVED_HOST"
        [ -n "$SAVED_PORT" ] && METRO_PORT="$SAVED_PORT"
    fi

    echo -e "\n${BLUE}Metro 설정 (현재: ${METRO_HOST}:${METRO_PORT})${NC}"
    read -p "Metro Host (Enter=유지): " INPUT_HOST
    METRO_HOST="${INPUT_HOST:-$METRO_HOST}"
    read -p "Metro Port (Enter=유지): " INPUT_PORT
    METRO_PORT="${INPUT_PORT:-$METRO_PORT}"

    # .env.local 저장
    sed -i '' "/^METRO_HOST=/d" "$ENV_LOCAL" 2>/dev/null
    sed -i '' "/^METRO_PORT=/d" "$ENV_LOCAL" 2>/dev/null
    echo "METRO_HOST=${METRO_HOST}" >> "$ENV_LOCAL"
    echo "METRO_PORT=${METRO_PORT}" >> "$ENV_LOCAL"

    # build.gradle 업데이트
    sed -i '' "s/versionCode ${CURRENT_VERSION_CODE}/versionCode ${NEW_VERSION_CODE}/" "$BUILD_GRADLE"
    sed -i '' "s/versionName \"${CURRENT_VERSION_NAME}\"/versionName \"${NEW_VERSION_NAME}\"/" "$BUILD_GRADLE"

    echo -e "${BLUE}🔨 빌드 중...${NC}"
    cd android
    ./gradlew clean assembleDebug -PreactNativeDevServerPort="${METRO_PORT}" -PdevServerHost="${METRO_HOST}"
    BUILD_RESULT=$?
    cd "$PROJECT_ROOT"

    if [ $BUILD_RESULT -ne 0 ]; then
        echo -e "${RED}❌ 빌드 실패${NC}"
        exit 1
    fi

    cp "$APK_OUTPUT_PATH" "$CACHED_APK"
    echo -e "${GREEN}✅ 빌드 및 캐시 완료!${NC}\n"
fi

# ============================================
# 3단계: 기기 선택 및 설치 (에뮬레이터 제외)
# ============================================
echo -e "${BLUE}🔍 연결된 실기기 확인 중...${NC}"
# 에뮬레이터(emulator-) 제외하고 실제 기기만 필터링
DEVICES=($(adb devices | grep -v "List" | grep "device$" | grep -v "emulator-" | awk '{print $1}'))
DEVICE_COUNT=${#DEVICES[@]}

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ 연결된 기기가 없습니다.${NC}"
    echo -e "${YELLOW}APK 보관 위치: ${CACHED_APK}${NC}"
    exit 1
elif [ "$DEVICE_COUNT" -eq 1 ]; then
    TARGET_DEVICE="${DEVICES[0]}"
    echo -e "${GREEN}✅ 단일 기기 발견: ${TARGET_DEVICE}${NC}"
else
    echo -e "${YELLOW}⚠️  여러 대의 기기가 발견되었습니다. 설치할 기기를 선택하세요:${NC}"
    for i in "${!DEVICES[@]}"; do
        MODEL=$(adb -s "${DEVICES[$i]}" shell getprop ro.product.model)
        echo -e "  [$((i+1))] ${DEVICES[$i]} (${MODEL})"
    done
    read -p "선택 (번호 입력, 기본값 1): " DEVICE_INDEX
    DEVICE_INDEX=${DEVICE_INDEX:-1}
    TARGET_DEVICE="${DEVICES[$((DEVICE_INDEX-1))]}"
fi

echo -e "${GREEN}📲 ${TARGET_DEVICE}에 설치를 시작합니다...${NC}"

adb -s "$TARGET_DEVICE" install -r -d "$CACHED_APK"
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  단순 설치 실패, 재시도 (삭제 후 설치)...${NC}"
    adb -s "$TARGET_DEVICE" uninstall "$PACKAGE_NAME"
    adb -s "$TARGET_DEVICE" install "$CACHED_APK"
fi

# ============================================
# 4단계: Metro 및 앱 실행
# ============================================
PREFS_FILE="/data/data/${PACKAGE_NAME}/shared_prefs/${PACKAGE_NAME}_preferences.xml"
METRO_CONFIG="${METRO_HOST}:${METRO_PORT}"

echo -e "${BLUE}🔧 Metro 서버 자동 설정 중 (${METRO_CONFIG})...${NC}"

set_metro_host() {
    # run-as를 사용하여 shared_prefs 수정
    adb -s "$TARGET_DEVICE" shell "run-as ${PACKAGE_NAME} sh -c \"
        if [ ! -f '${PREFS_FILE}' ]; then
            echo '<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\" standalone=\\\"yes\\\"?><map></map>' > '${PREFS_FILE}'
        fi
        if grep -q 'debug_http_host' '${PREFS_FILE}'; then
            sed -i 's|<string name=\\\"debug_http_host\\\">.*</string>|<string name=\\\"debug_http_host\\\">${METRO_CONFIG}</string>|' '${PREFS_FILE}'
        else
            sed -i 's|</map>|    <string name=\\\"debug_http_host\\\">${METRO_CONFIG}</string>\\n</map>|' '${PREFS_FILE}'
        fi
    \"" 2>/dev/null
}

set_metro_host

echo -e "${YELLOW}🚀 앱을 실행합니까? (Y/n):${NC}"
read -p "" LAUNCH_APP
if [[ ! "$LAUNCH_APP" =~ ^[Nn]$ ]]; then
    adb -s "$TARGET_DEVICE" shell am start -n "${PACKAGE_NAME}/.MainActivity"
    # 실행 후 파일이 생성되었을 수 있으므로 한 번 더 설정 (첫 설치 시 대비)
    sleep 2
    set_metro_host
    echo -e "${GREEN}✅ 실행 완료! (설정 적용을 위해 앱 내에서 Reload가 필요할 수 있습니다)${NC}"
fi

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 모든 작업이 완료되었습니다!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
