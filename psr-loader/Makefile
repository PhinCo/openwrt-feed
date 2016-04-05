include $(TOPDIR)/rules.mk

PKG_NAME := psr-loader
PGK_RELEASE := 1
PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/psr-loader
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Loads PS keys into the BT chipset
  VERSION:=42
endef

define Package/psr-loader/description
	A utility that load PS commands from a file and stores them in the BT chipset
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	cp -R ./* $(PKG_BUILD_DIR)/
endef

PSR_LOADER_FILES := \
	src/uart.c \
	src/ubcsp.c \
	src/bccmd.c \
	src/csr.c \
	src/csr_bcsp.c

PSR_LOADER_CFLAGS := \
	-I./include

define Build/Compile
	  $(TARGET_CC) $(TARGET_CFLAGS) $(PSR_LOADER_CFLAGS) -o $(PKG_BUILD_DIR)/$(PKG_NAME) $(PSR_LOADER_FILES)	  
endef

define Build/Configure
endef

define Package/psr-loader/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/$(PKG_NAME) $(1)/bin
endef

$(eval $(call BuildPackage,psr-loader))
