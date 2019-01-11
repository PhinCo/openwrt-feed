include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

TOP_DIRS := \
	etc \
	etc/init.d \
	etc/config \
	opt \
	opt/scripts \
	opt/scripts/wificlient \
	opt/scripts/wifiap \

TOP_SCRIPTS := 

TOP_TEMPLATES := 

PHIN_BRIDGE_1DOT1_FILES := \
	src/main.c \

PHIN_BRIDGE_1DOT1_CFLAGS := \
	-I./include \
	-lcrypto \
	-lpthread \

define Package/phin-bridge-1dot1
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Phin Bridge 1.1
  VERSION:=1
  DEPENDS:=+libopenssl
endef

define Package/phin-bridge-1dot1/description
	Bomb-ass bluetooth to wifi bridge
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -R $(FW_DIRS) $(TOP_DIRS) $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
	  $(TARGET_CC) $(TARGET_CFLAGS) $(PHIN_BRIDGE_1DOT1_CFLAGS) -o $(PKG_BUILD_DIR)/$(PKG_NAME) $(PHIN_BRIDGE_1DOT1_FILES)
endef

define Package/phin-bridge-1dot1/install
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done
	for f in $(TOP_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/$(PKG_NAME) $(1)/bin
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
