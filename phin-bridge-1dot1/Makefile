include $(TOPDIR)/rules.mk

PKG_NAME := phin-bridge-1dot1
PGK_RELEASE := 4
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

BINS := \
	files/etc/init.d/phinServices \
	files/opt/phin/bridge \
	files/opt/phin/start.sh \
	
TEMPLATES := \
	etc/config/network \
	etc/config/wireless \

DIRS := \
	etc/config \
	etc/init.d \
	opt/phin \

BINS := \
	etc/init.d/phinServices \
	opt/phin/bridge \
	opt/phin/start.sh \

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
	cp -R $(FW_DIRS) $(DIRS) $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/phin-bridge-1dot1/install
	echo INSTALL DIR PHASE
	for f in $(DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done

	echo INSTALL BIN PHASE
	for f in $(BIN); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	echo INSTALL TEMPLATES PHASE
	for f in $(TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done
endef

$(eval $(call BuildPackage,phin-bridge-1dot1))
