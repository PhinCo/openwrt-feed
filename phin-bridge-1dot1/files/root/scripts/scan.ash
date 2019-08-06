#!/usr/bin/env ash
echo "Setting SiteSurvey"
iwpriv apcli0 set SiteSurvey=1
sleep 1
echo "Getting SiteSurvey"
iwpriv apcli0 get_site_survey
