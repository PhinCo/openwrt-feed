include $(TOPDIR)/rules.mk

PKG_NAME := ble-hci-bridge
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

TOP_SCRIPTS := \
	etc/init.d/gpiosetup-led \
	etc/init.d/playgroundServices \
	etc/btsetup.sh \
	opt/scripts/wificlient.sh \
	opt/scripts/wifiap.sh \

TOP_TEMPLATES := \
	etc/default.psr \
	etc/config/network \
	etc/config/wireless \
	opt/scripts/wificlient/wireless \
	opt/scripts/wificlient/network \
	opt/scripts/wificlient/dhcp \
	opt/scripts/wifiap/wireless \
	opt/scripts/wifiap/network \
	opt/scripts/wifiap/dhcp \

BLE_HCI_BRIDGE_FILES := \
	src/main.c \
	src/uart_bcsp_hci.c \
	src/ubcsp.c \
	src/log.c \
	src/ecdh.c \
	src/encryption.c \
	src/hci_bridge.c \

BLE_HCI_BRIDGE_CFLAGS := \
	-I./include \
	-lcrypto \
	-lpthread \

define Package/ble-hci-bridge
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=BLE bridge over HCI
  VERSION:=42
  DEPENDS:=+nodejs-mips +libopenssl +psrloader
endef

define Package/ble-hci-bridge/description
	Native daemon that interacts with the CSR BLE part using HCI over UART. The package also
	requests the nodejs dependencies
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -R $(FW_DIRS) $(TOP_DIRS) $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
	  $(TARGET_CC) $(TARGET_CFLAGS) $(BLE_HCI_BRIDGE_CFLAGS) -o $(PKG_BUILD_DIR)/$(PKG_NAME) $(BLE_HCI_BRIDGE_FILES)
endef

define Package/ble-hci-bridge/install
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

$(eval $(call BuildPackage,ble-hci-bridge))
