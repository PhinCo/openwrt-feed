include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 4
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

BINS := \
	files/etc/init.d/phinServices \
	files/opt/phin/bridge \
	files/opt/phin/start.sh \
	
TOP_TEMPLATES := 

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
	echo step Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
	$(CP) ./files $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/phin-bridge-1dot1/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/opt/phin

	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/phinServices $(1)/etc/init.d/phinServices
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/bridge $(1)/opt/phin/bridge
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/opt/phin/start.sh $(1)/opt/phin/start.sh
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/config/wireless $(1)/etc/config/wireless
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/config/network $(1)/etc/config/network
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
