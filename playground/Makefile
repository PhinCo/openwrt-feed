include $(TOPDIR)/rules.mk

PKG_NAME := playground
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

FW_DIRS := \
	bin \
	logs \

TOP_DIRS := \
	etc \
	etc/init.d \
	etc/config \

TOP_SCRIPTS := \
	etc/init.d/gpiosetup-led \
	etc/init.d/playgroundServices \

FW_SCRIPTS := \
	bin/btsetup.sh \

TOP_TEMPLATES := \
	etc/default.psr \
	etc/config/network \
	etc/config/wireless_template \
	etc/config/wireless \

define Package/playground
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Playground Framework
  VERSION:=42
  DEPENDS:=+nodejs-mips +ble-hci-bridge
endef

define Package/playground/description
	The Node.js-based BLE, app, and OTA framework maintained by Playground Global.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -R $(FW_DIRS) $(TOP_DIRS) $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/playground/install
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done
	for f in $(TOP_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
	for f in $(FW_DIRS); do \
		$(INSTALL_DIR) $(1)/opt/playground/$$$$f; \
	done
	for f in $(FW_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/opt/playground/$$$$f; \
	done
	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
endef

$(eval $(call BuildPackage,playground))
