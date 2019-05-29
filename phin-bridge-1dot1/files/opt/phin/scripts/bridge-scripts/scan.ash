#!/bin/ash
echo "setting SiteSurvey"
iwpriv apcli0 set SiteSurvey=1
sleep 1
echo "getting SiteSurvey"
iwpriv apcli0 get_site_survey
