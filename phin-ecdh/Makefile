include $(TOPDIR)/rules.mk

PKG_NAME := phin-ecdh
PGK_RELEASE := 2
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

PHIN_ECDH_FILES := \
	src/cli/main.c \
	src/cli/commands.c \
	src/lib/ecdh.c \
	src/lib/encryption.c \
	src/utils/file-utils.c \
	src/utils/pem-utils.c \

PHIN_ECDH_CFLAGS := \
	-I./src/lib \
	-I./src/cli \
	-I./src/utils \
	-lcrypto \

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
	$(INSTALL_DIR) $(1)/opt/phin/ecdh
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/$(PKG_NAME) $(1)/opt/phin/ecdh/phin-ecdh
endef

$(eval $(call BuildPackage,phin-ecdh))
