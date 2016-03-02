include $(TOPDIR)/rules.mk

PKG_NAME := redbridge-dev
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/redbridge-dev
	SECTION := utils
	CATEGORY := Utilities
	TITLE := Redbridge Development Mode
	VERSION := 42
	DEPENDS := +dropbear
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) -R ./files $(PKG_BUILD_DIR)/
	echo "all:" > $(PKG_BUILD_DIR)/Makefile
endef

define Package/redbridge-dev/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/telnet $(1)/etc/init.d/telnet
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/bin/login.sh $(1)/bin/login.sh
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/fw_env.config $(1)/etc/fw_env.config
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/inittab $(1)/etc/inittab
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/banner $(1)/etc/banner
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/network $(1)/etc/config/network
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/wireless $(1)/etc/config/wireless
endef

define Package/redbridge-dev/description
	Install some config files and tools to enable various
	development tools for Redbridge -- telnet, default networking, etc.
endef

$(eval $(call BuildPackage,redbridge-dev))
