include $(TOPDIR)/rules.mk

PKG_NAME:=v8-mips
PKG_VERSION:=42
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/paul99/v8m-rb.git
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE_VERSION:=90a7f7b10aa2dc8a3a7f65f6092d68bffd729243
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz
PKG_USE_MIPS16:=0 # V8 MIPS code has asm that is MIPS32-only

include $(INCLUDE_DIR)/package.mk

define Package/v8-mips
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=V8 for MIPS
  DEPENDS:=+libstdcpp
endef

define Package/v8-mips/description
  A build of the V8 JavaScript engine for MIPS chips.
  Since tip-of-tree V8 doesn't support MIPS anymore, this is a build
  of antique V8 0.15.5
endef

MAKE_FLAGS+=LINK=mips-openwrt-linux-g++ dependencies mips.release library=shared snapshot=off werror=no

# TARGET_CXXFLAGS here is a kludge. The v8 MIPS build requires both -mips32r2 to the compiler and
# -Wa,-mips32r2 to pass to the assembler; without the latter, the assembler assumes mips32, which
# causes the compilation to fail with an unknown instruction. The "internal" V8 build sets both;
# however the OpenWRT build that "wraps" the V8 build with additional CXXFLAGS of its own *also*
# sets -mips32r2 again -- which resets/undoes the previous -Wa,-mips32r2. So we stick the assembler
# directive here in our own Makefile, which gets it tacked onto the end of CXXFLAGS and makes
# everything work. This is gross and illustrates brittleness in the OpenWRT build system, but it
# works. At least on ToT master. At least for now.
TARGET_CXXFLAGS+=-Wa,-mips32r2

define Package/v8-mips/install
	$(INSTALL_DIR) $(1)/lib
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/out/mips.release/lib.target/libv8.so $(1)/lib/libv8.so
endef

define Build/InstallDev
	$(INSTALL_DIR) $(STAGING_DIR)/v8-include
	$(CP) $(PKG_BUILD_DIR)/include $(STAGING_DIR)/v8-include
	$(INSTALL_DIR) $(STAGING_DIR)/v8-lib
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/out/mips.release/lib.target/libv8.so $(STAGING_DIR)/v8-lib/libv8.so
endef

$(eval $(call BuildPackage,v8-mips))
