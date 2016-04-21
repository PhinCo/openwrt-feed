include $(TOPDIR)/rules.mk

PKG_NAME := gjallarhorn
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/gjallarhorn
	SECTION := utils
	CATEGORY := Utilities
	TITLE := Gjallarhorn
	VERSION := 42
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/gjallarhorn.c ./src/Makefile ./files $(PKG_BUILD_DIR)/
endef

define Package/gjallarhorn/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/gpiosetup $(1)/etc/init.d/gpiosetup
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/gjallarhorn $(1)/etc/init.d/gjallarhorn
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/gjallarhorn $(1)/usr/bin/gjallarhorn
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/resetled.sh $(1)/usr/bin/resetled.sh
endef

define Package/gjallarhorn/description
	The horn whose sounding heralds the coming apocalypse:
	Upon holding the reset button for 10
	seconds, initiates a factory reset.
endef

$(eval $(call BuildPackage,gjallarhorn))
