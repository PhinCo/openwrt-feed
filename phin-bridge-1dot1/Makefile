include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 6
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/phin-bridge-1dot1
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Phin Bridge 1.1
  VERSION:=1
  DEPENDS:=+libopenssl +phin-ecdh
endef

define Package/phin-bridge-1dot1/description
	The magical marvelous monstrous pHin Bridge 1.1
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) -R ./files $(PKG_BUILD_DIR)/
	echo "all:" > $(PKG_BUILD_DIR)/Makefile
endef

define Package/phin-bridge-1dot1/install
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DIR) $(1)/opt/phin
	$(INSTALL_DIR) $(1)/opt/phin/firmware
	$(INSTALL_DIR) $(1)/opt/phin/admin
	$(INSTALL_DIR) $(1)/opt/phin/admin/js
	$(INSTALL_DIR) $(1)/opt/phin/config

	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/phin_bridge $(1)/etc/init.d/phin_bridge
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/bridge $(1)/opt/phin/bridge
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/unlock.sh $(1)/opt/phin/unlock.sh

	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/version $(1)/opt/phin/version

	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/network $(1)/etc/config/network
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/wireless $(1)/etc/config/wireless
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/firmware/application.gbl $(1)/opt/phin/firmware/application.gbl
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/firmware/manifest.json $(1)/opt/phin/firmware/manifest.json
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/favicon.png $(1)/opt/phin/admin/favicon.png
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/index.html $(1)/opt/phin/admin/index.html
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/logo.png $(1)/opt/phin/admin/logo.png
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/script.js $(1)/opt/phin/admin/script.js
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/style.css $(1)/opt/phin/admin/style.css

	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/js/app.js $(1)/opt/phin/admin/js/app.js
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/js/common.js $(1)/opt/phin/admin/js/common.js
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/js/devView.js $(1)/opt/phin/admin/js/devView.js
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/js/statsView.js $(1)/opt/phin/admin/js/statsView.js
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/admin/js/wifiView.js $(1)/opt/phin/admin/js/wifiView.js

endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
