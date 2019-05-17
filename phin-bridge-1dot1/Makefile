include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 9
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
	The magical marvelous and mysteriously monstrous pHin Bridge 1.1
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
	$(INSTALL_DIR) $(1)/root

	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/phin_bridge $(1)/etc/init.d/phin_bridge
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/bridge $(1)/opt/phin/bridge
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/unlock $(1)/opt/phin/unlock

	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/opt/phin/version $(1)/opt/phin/version
	$(CP) -R $(PKG_BUILD_DIR)/files/opt/phin/admin $(1)/opt/phin/admin
	$(CP) -R $(PKG_BUILD_DIR)/files/opt/phin/firmware $(1)/opt/phin/firmware

	$(CP) -R $(PKG_BUILD_DIR)/files/root/.secureKeys/ $(1)/root

	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/network $(1)/etc/config/network
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
