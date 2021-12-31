var tolCM = (function (exports) {
  'use strict';

  const viewModelMaterialBand = {
      gradient: false,
      band1Position: 7000.0,
      band2Position: 7500.0,
      band3Position: 8000.0,
      bandThickness: 100.0,
      bandTransparency: 0.5,
      backgroundTransparency: 0.75,
  };

  function updateMaterialBand(viewer, viewModel = viewModelMaterialBand) {
      let gradient = Boolean(viewModel.gradient);
      let band1Position = Number(viewModel.band1Position);
      let band2Position = Number(viewModel.band2Position);
      let band3Position = Number(viewModel.band3Position);
      let bandThickness = Number(viewModel.bandThickness);
      let bandTransparency = Number(viewModel.bandTransparency);
      let backgroundTransparency = Number(viewModel.backgroundTransparency);
      let layers = [];
      let backgroundLayer = {
          entries: [
              {
                  height: 4200.0,
                  color: new Cesium.Color(0.0, 0.0, 0.2, backgroundTransparency),
              },
              {
                  height: 8000.0,
                  color: new Cesium.Color(1.0, 1.0, 1.0, backgroundTransparency),
              },
              {
                  height: 8500.0,
                  color: new Cesium.Color(1.0, 0.0, 0.0, backgroundTransparency),
              },
          ],
          extendDownwards: true,
          extendUpwards: true,
      };
      layers.push(backgroundLayer);
      let gridStartHeight = 4200.0;
      let gridEndHeight = 8848.0;
      let gridCount = 50;
      for (let i = 0; i < gridCount; i++) {
          let lerper = i / (gridCount - 1);
          let heightBelow = Cesium.Math.lerp(gridStartHeight, gridEndHeight, lerper);
          let heightAbove = heightBelow + 10.0;
          let alpha = Cesium.Math.lerp(0.2, 0.4, lerper) * backgroundTransparency;
          layers.push({
              entries: [
                  {
                      height: heightBelow,
                      color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                  },
                  {
                      height: heightAbove,
                      color: new Cesium.Color(1.0, 1.0, 1.0, alpha),
                  },
              ],
          });
      }
      let antialias = Math.min(10.0, bandThickness * 0.1);
      if (!gradient) {
          let band1 = {
              entries: [
                  {
                      height: band1Position - bandThickness * 0.5 - antialias,
                      color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                  },
                  {
                      height: band1Position - bandThickness * 0.5,
                      color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                  },
                  {
                      height: band1Position + bandThickness * 0.5,
                      color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                  },
                  {
                      height: band1Position + bandThickness * 0.5 + antialias,
                      color: new Cesium.Color(0.0, 0.0, 1.0, 0.0),
                  },
              ],
          };
          let band2 = {
              entries: [
                  {
                      height: band2Position - bandThickness * 0.5 - antialias,
                      color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                  },
                  {
                      height: band2Position - bandThickness * 0.5,
                      color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                  },
                  {
                      height: band2Position + bandThickness * 0.5,
                      color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                  },
                  {
                      height: band2Position + bandThickness * 0.5 + antialias,
                      color: new Cesium.Color(0.0, 1.0, 0.0, 0.0),
                  },
              ],
          };
          let band3 = {
              entries: [
                  {
                      height: band3Position - bandThickness * 0.5 - antialias,
                      color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                  },
                  {
                      height: band3Position - bandThickness * 0.5,
                      color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                  },
                  {
                      height: band3Position + bandThickness * 0.5,
                      color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                  },
                  {
                      height: band3Position + bandThickness * 0.5 + antialias,
                      color: new Cesium.Color(1.0, 0.0, 0.0, 0.0),
                  },
              ],
          };
          layers.push(band1);
          layers.push(band2);
          layers.push(band3);
      }
      else {
          let combinedBand = {
              entries: [
                  {
                      height: band1Position - bandThickness * 0.5,
                      color: new Cesium.Color(0.0, 0.0, 1.0, bandTransparency),
                  },
                  {
                      height: band2Position,
                      color: new Cesium.Color(0.0, 1.0, 0.0, bandTransparency),
                  },
                  {
                      height: band3Position + bandThickness * 0.5,
                      color: new Cesium.Color(1.0, 0.0, 0.0, bandTransparency),
                  },
              ],
          };
          layers.push(combinedBand);
      }
      let material = Cesium.createElevationBandMaterial({
          scene: viewer.scene,
          layers: layers,
      });
      viewer.scene.globe.material = material;
  }

  exports.updateMaterialBand = updateMaterialBand;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
