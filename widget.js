const widget = new ListWidget()

let values = await loadValues()

let percent = values.StateOfCharge
const isCharging = values.ModeConverter == 'CHARGING'
const isOff = values.ModeConverter == 'OFF'

let isValid = !Number.isNaN(percent)
console.log("isValid " + isValid)
console.log("percent " + percent)
console.log("isCharging " + isCharging)

if (!isValid)
    percent = 0

let progressStack = await progressCircle(widget, percent)

const mainIconName = isValid ? "house.fill" : "exclamationmark.triangle"

const hasBadge = isCharging || isOff

let mainIcon = SFSymbol.named(mainIconName)
mainIcon.applyFont(Font.regularSystemFont(26))
mainIcon = progressStack.addImage(mainIcon.image)
const mainImageSize = hasBadge ? 30 : 36;
mainIcon.imageSize = new Size(mainImageSize, mainImageSize)
mainIcon.tintColor = new Color("#fafafa")

if (hasBadge) {
  const badgeName = isCharging ? "bolt.fill" : "zzz"
  let badgeIcon = SFSymbol.named(badgeName)
    badgeIcon.applyFont(Font.regularSystemFont(26))
  badgeIcon = progressStack.addImage(badgeIcon.image)
  badgeIcon.imageSize = new Size(12, 12)
  badgeIcon.tintColor = new Color("#fafafa")
 }

  
widget.presentAccessoryCircular() // Does not present correctly

//widget.presentSmall()

Script.setWidget(widget)
Script.complete()

async function progressCircle(
  on,
  value = 50,
  colour = "hsl(0, 0%, 100%)",
  background = "hsl(0, 0%, 10%)",
  size = 60,
  barWidth = 5.5
) {
  if (value > 1) {
    value /= 100
  }
  if (value < 0) {
    value = 0
  }
  if (value > 1) {
    value = 1
  }

  async function isUsingDarkAppearance() {
    return !Color.dynamic(Color.white(), Color.black()).red
  }
  let isDark = await isUsingDarkAppearance()

  if (colour.split("-").length > 1) {
    if (isDark) {
      colour = colour.split("-")[1]
    } else {
      colour = colour.split("-")[0]
    }
  }

  if (background.split("-").length > 1) {
    if (isDark) {
      background = background.split("-")[1]
    } else {
      background = background.split("-")[0]
    }
  }

  let w = new WebView()
  await w.loadHTML('<canvas id="c"></canvas>')

  let base64 = await w.evaluateJavaScript(
    `
  let colour = "${colour}",
    background = "${background}",
    size = ${size}*3,
    lineWidth = ${barWidth}*3,
    percent = ${value * 100}
      
  let canvas = document.getElementById('c'),
    c = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  let posX = canvas.width / 2,
    posY = canvas.height / 2,
    onePercent = 360 / 100,
    result = onePercent * percent
  c.lineCap = 'round'
  c.beginPath()
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
  c.strokeStyle = background
  c.lineWidth = lineWidth 
  c.stroke()
  c.beginPath()
  c.strokeStyle = colour
  c.lineWidth = lineWidth
  c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
  c.stroke()
  completion(canvas.toDataURL().replace("data:image/png;base64,",""))`,
    true
  )
  const image = Image.fromData(Data.fromBase64String(base64))
  
  let stack = on.addStack()
  stack.size = new Size(size, size)
  stack.backgroundImage = image
  stack.centerAlignContent()
  let padding = barWidth * 2
  stack.setPadding(padding, padding, padding, padding)

  return stack
}



async function loadValues() {
  
  let url = "https://api.kvstore.io/collections/TODO-COLLECTION/items/TODO-ITEMKEY"
  
  let req = new Request(url)
  req.headers = { "kvstoreio_api_key": "TODO-APIKEY" }
  
  let jsonString = await req.loadString()
  
  // kvstore json
  let json = JSON.parse(jsonString)
  
  jsonString = json.value
  
  // abgelegtes json als value
  let innerJson = JSON.parse(jsonString);
  
  console.log(innerJson)
  
  return innerJson
}

