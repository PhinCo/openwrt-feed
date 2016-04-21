include $(TOPDIR)/rules.mk

PKG_NAME := ble-hci-bridge
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/ble-hci-bridge
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=BLE bridge over HCI
  VERSION:=42
  DEPENDS:=+libopenssl +psrloader
endef

define Package/ble-hci-bridge/description
	A command-line tool for interacting with the CSR BLE part using HCI over UART.
	Loads PSR config, etc.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -R ./* $(PKG_BUILD_DIR)/
endef

BLE_HCI_BRIDGE_FILES := \
	src/main.c \
	src/uart_bcsp_hci.c \
	src/ubcsp.c \
	src/log.c \
	src/ecdh.c \
	src/encryption.c \
	src/hci_bridge.c

BLE_HCI_BRIDGE_CFLAGS := \
	-I./include \
	-lcrypto \
	-lpthread

define Build/Compile
	  $(TARGET_CC) $(TARGET_CFLAGS) $(BLE_HCI_BRIDGE_CFLAGS) -o $(PKG_BUILD_DIR)/$(PKG_NAME) $(BLE_HCI_BRIDGE_FILES)
endef

define Build/Configure
endef

define Package/ble-hci-bridge/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/$(PKG_NAME) $(1)/bin
endef

$(eval $(call BuildPackage,ble-hci-bridge))
