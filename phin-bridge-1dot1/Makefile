include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 4
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

TOP_DIRS := \
	etc \
	opt \

SCRIPTS := \
	etc/init.d/phinServices \
	opt/phin/bridge \
	opt/phin/start.sh \
	
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
	echo FW_DIRS $(FW_DIRS)
	cp -R $(FW_DIRS) $(TOP_DIRS) $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/phin-bridge-1dot1/install
	echo step 1
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done

	echo step 2
	for f in $(SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	echo step 3
	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
