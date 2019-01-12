include $(TOPDIR)/rules.mk

PKG_NAME := phin-ecdh
PGK_RELEASE := 2
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

TOP_DIRS := 

TOP_SCRIPTS := 

TOP_TEMPLATES := 

PHIN_ECDH_FILES := \
	src/main.c \
	src/ecdh/ecdh.c \
	src/ecdh/encryption.c \
	src/utils/file-utils.c \
	src/utils/pem-utils.c \

PHIN_ECDH_CFLAGS := \
	-I./src/ecdh \
	-I./src/utils \

define Package/phin-ecdh
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=phin-ecdh
  VERSION:=1
  DEPENDS:=+libopenssl
endef

define Package/ecdh/description
	pHin ecdh command line tool
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
	  $(TARGET_CC) $(TARGET_CFLAGS) $(PHIN_ECDH_CFLAGS) -o $(PKG_BUILD_DIR)/$(PKG_NAME) $(PHIN_ECDH_FILES)
endef

define Package/phin-ecdh/install
	for f in $(TOP_DIRS); do \
		$(INSTALL_DIR) $(1)/$$$$f; \
	done
	for f in $(TOP_SCRIPTS); do \
		$(INSTALL_BIN) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	for f in $(TOP_TEMPLATES); do \
		$(INSTALL_DATA) $(PKG_BUILD_DIR)/$$$$f $(1)/$$$$f; \
	done

	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/$(PKG_NAME) $(1)/bin
endef

$(eval $(call BuildPackage,phin-ecdh))
