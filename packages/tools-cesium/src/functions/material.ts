import { viewModelMaterialBand } from '../defaultModels/material'

export function updateMaterialBand(
  viewer: Cesium.Viewer,
  viewModel = viewModelMaterialBand
) {
  // true，混合色；false：纯色；
  let gradient = Boolean(viewModel.gradient)
  // 蓝色
  let band1Position = Number(viewModel.band1Position)
  // 绿色
  let band2Position = Number(viewModel.band2Position)
  // 红色
  let band3Position = Number(viewModel.band3Position)
  // 厚度
  let bandThickness = Number(viewModel.bandThickness)
  // 透明度（带子）
  let bandTransparency = Number(viewModel.bandTransparency)
  // 透明度（背景）
  let backgroundTransparency = Number(viewModel.backgroundTransparency)

  let layers = []

  // 关注点（三色海拔条）
  let backgroundLayer = {
    entries: [
      {
        height: 4200.0,
        color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency)
      },
      {
        height: 8000.0,
        color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency)
      },
      {
        height: 8500.0,
        color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency)
      }
    ],
    extendDownwards: true,
    extendUpwards: true
  }
  layers.push(backgroundLayer)

  // 海拔线（间隔50）
  let gridStartHeight = 4200.0
  let gridEndHeight = 8848.0
  let gridCount = 50
  for (let i = 0; i < gridCount; i++) {
    let lerper = i / (gridCount - 1)
    let heightBelow = Cesium.Math.lerp(gridStartHeight, gridEndHeight, lerper)
    let heightAbove = heightBelow + 10.0
    let alpha = Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency
    layers.push({
      entries: [
        {
          height: heightBelow,
          color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
        },
        {
          height: heightAbove,
          color: new Cesium.Color(1.0, 1.0, 1.0, alpha)
        }
      ]
    })
  }

  let antialias = Math.min(10.0, bandThickness * 0.1)

  if (!gradient) {
    let band1 = {
      entries: [
        {
          height: band1Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
        },
        {
          height: band1Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band1Position + bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band1Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(0.0, 0.0, 1.0, 0.0)
        }
      ]
    }

    let band2 = {
      entries: [
        {
          height: band2Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
        },
        {
          height: band2Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band2Position + bandThickness * 0.5,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band2Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(0.0, 1.0, 0.0, 0.0)
        }
      ]
    }

    let band3 = {
      entries: [
        {
          height: band3Position - bandThickness * 0.5 - antialias,
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
        },
        {
          height: band3Position - bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5 + antialias,
          color: new Cesium.Color(1.0, 0.0, 0.0, 0.0)
        }
      ]
    }

    layers.push(band1)
    layers.push(band2)
    layers.push(band3)
  } else {
    let combinedBand = {
      entries: [
        {
          height: band1Position - bandThickness * 0.5,
          color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency)
        },
        {
          height: band2Position,
          color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency)
        },
        {
          height: band3Position + bandThickness * 0.5,
          color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency)
        }
      ]
    }

    layers.push(combinedBand)
  }

  let material = Cesium.createElevationBandMaterial({
    scene: viewer.scene,
    layers: layers
  })
  viewer.scene.globe.material = material
}
