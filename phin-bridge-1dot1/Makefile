include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 3
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

TOP_DIRS := \
	etc \
	etc/init.d \
	etc/config \
	opt \

TOP_SCRIPTS := \
	etc/init.d/phinServices \
	opt/phin/bridge \
	opt/phin/start.sh \
	
TOP_TEMPLATES := 

define Package/phin-bridge-1dot1
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Phin Bridge 1.1
  VERSION:=1
  DEPENDS:=+libopenssl
endef

define Package/phin-bridge-1dot1/description
	The magical marvelous monstrous pHin Bridge 1.1
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/phin-bridge-1dot1/install
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done

	for f in $(TOP_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
