#
# hua.shao@mediatek.com
#
# MTK Property Software.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=uci2dat
PKG_RELEASE:=5

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)
PKG_CONFIG_DEPENDS:=

include $(INCLUDE_DIR)/package.mk

define Package/uci2dat
  SECTION:=base
  CATEGORY:=gl-inet
  DEPENDS:=@TARGET_ramips_mt76x8 +libuci
  TITLE:=Translate uci config into ralink wifi dat format
endef

define Package/uci2dat/description
  Translate uci config into ralink wifi dat format
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

TARGET_CFLAGS += -luci -Wall
TARGET_CFLAGS += -Wno-error=format-security 

define Build/Configure
endef


define Package/uci2dat/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/uci2dat $(1)/usr/bin

	$(CP) ./files/* $(1)
endef


$(eval $(call BuildPackage,uci2dat))

