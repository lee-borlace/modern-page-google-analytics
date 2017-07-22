Param(
  [string]$siteCollectionUrl,
  [string]$gaId
)

Connect-PnPOnline -Url $siteCollectionUrl
$configList = New-PnPList -Title Configuration -Template GenericList -EnableVersioning
Add-PnPField -List Configuration -DisplayName Value -InternalName Value -Type Text -AddToDefaultView -Required
$item = Add-PnPListItem -List Configuration -Values @{"Title" = "GoogleAnalyticsId"; "Value" = $gaId} -ContentType "Item"