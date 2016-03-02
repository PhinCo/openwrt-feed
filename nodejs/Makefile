include $(TOPDIR)/rules.mk

PKG_NAME := nodejs
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/nodejs
	SECTION := utils
	CATEGORY := Utilities
	TITLE := Node.js
	VERSION := 42
	DEPENDS := libstdcpp
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) -R ./files $(PKG_BUILD_DIR)/
	echo "all:" > $(PKG_BUILD_DIR)/Makefile
endef

define Package/nodejs/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_DIR) $(1)/lib
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/bin/node $(1)/bin/node
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/lib/libv8.so $(1)/lib/libv8.so
endef

define Package/nodejs/description
	Install the Node.js runtime (and V8, on which it depends.)
endef

$(eval $(call BuildPackage,nodejs))
