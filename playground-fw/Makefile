include $(TOPDIR)/rules.mk

PKG_NAME := playground-fw
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

FW_FILES := \
	api/Playground.js \
	bin/generateDefaultPSR.js \
	lib/PlaygroundCommandHandler.js \
	lib/ATTProtocolHandler.js \
	lib/GAPProtocolHandler.js \
	lib/CommandQueueManager.js \
	lib/Utils.js \
	lib/CrashManager.js \
	lib/Logger.js \
	lib/AttributeDb.js \
	lib/StateStore.js \
	lib/BTCtrlrLoopbackTCPAdapter.js \
	lib/HCIProtocolHandler.js \
	lib/ConnectionManager.js \
	lib/SharedState.js \
	svc/PlaygroundBridgeProvisioning.js \
	svc/OTAManager.js \

FW_DIRS := \
	api \
	bin \
	lib \
	logs \
	svc \

TOP_DIRS := \
	etc \
	etc/init.d \

TOP_SCRIPTS := \
	etc/init.d/gpiosetup-led \
	etc/init.d/playgroundPsr \
	etc/init.d/playgroundServices \

FW_SCRIPTS := \
	bin/btsetup.sh \

TOP_TEMPLATES := \
	etc/default.psr \
	etc/config/network \
	etc/config/wireless \

define Package/playground-fw
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Playground Framework
  VERSION:=42
  DEPENDS:=+nodejs-mips +ble-hci-bridge
endef

define Package/playground-fw/description
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

define Package/playground-fw/install
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done
	for f in $(TOP_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
	for f in $(FW_DIRS); do \
		$(INSTALL_DIR) $(1)/opt/playground/$$$$f; \
	done
	for f in $(FW_FILES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/opt/playground/$$$$f; \
	done
	for f in $(FW_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/opt/playground/$$$$f; \
	done
	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
endef

$(eval $(call BuildPackage,playground-fw))
