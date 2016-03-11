include $(TOPDIR)/rules.mk

PKG_NAME:=nodejs-mips
PKG_VERSION:=42
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/joyent/node.git
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE_VERSION=deeaf8fab978e3cadb364e46fb32dafdebe5f095
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz
PKG_USE_MIPS16:=0 # to match v8-mips build

include $(INCLUDE_DIR)/package.mk

define Package/nodejs-mips
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Node.js for MIPS
  DEPENDS:=+libstdcpp +v8-mips
endef

CONFIGURE_ARGS := \
	--without-npm \
	--without-snapshot \
	--shared-v8 \
	--shared-v8-includes=$(STAGING_DIR)/v8-include/include/ \
	--shared-v8-libpath=$(STAGING_DIR)/v8-lib \
	--dest-cpu=mips
# We have to have a custom Build/Configure block because gyp as used by this node.js refuses to
# accept a LINK override from make via internal macro; it will only "take" if it is set in the
# shell environment when ./configure is run. Let's not talk about how long this breakage took to
# figure out.
define Build/Configure
	(cd $(PKG_BUILD_DIR); \
	 export LINK="$(TARGET_CXX)"; \
	 ./configure $(CONFIGURE_ARGS); \
	);
endef

TARGET_CXXFLAGS += "-nostdinc++"
TARGET_LDFLAGS += "-nodefaultlibs -lc -lgcc -lgcc_s -lpthread -lstdc++"
MAKE_FLAGS += snapshot=off
define Build/Compile
	$(MAKE) $(PKG_JOBS) -C $(PKG_BUILD_DIR) $(MAKE_FLAGS)
endef

define Package/nodejs-mips/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/out/Release/node $(1)/bin/node
endef

define Package/nodejs-mips/description
	Install the Node.js runtime (and V8, on which it depends.)
endef

$(eval $(call BuildPackage,nodejs-mips))
