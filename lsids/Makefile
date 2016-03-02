include $(TOPDIR)/rules.mk

PKG_NAME := lsids
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/lsids
	SECTION := utils
	CATEGORY := Utilities
	TITLE := lsids -- list device ART identifiers
	VERSION := 42
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/lsids.c ./src/Makefile $(PKG_BUILD_DIR)/
endef

define Package/lsids/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lsids $(1)/usr/bin/
endef

define Package/lsids/description
	Outputs a JSON object to stdout, containing 
	key identifiers for the device read from the
	QCA ART partition.
endef

$(eval $(call BuildPackage,lsids))
