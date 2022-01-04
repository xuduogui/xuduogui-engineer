const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain()
})

const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings())

viewer.camera.flyTo({
  destination: new Cesium.Cartesian3(
    290637.5534733206,
    5637471.593707632,
    2978256.8126927214
  ),
  orientation: {
    heading: 4.747266966349747,
    pitch: -0.2206998858596192,
    roll: 6.280340554587955
  }
})

const model = {
  gradient: true,
  band1Position: 7000.0,
  band2Position: 7500.0,
  band3Position: 8000.0,
  bandThickness: 100.0,
  bandTransparency: 0.5,
  backgroundTransparency: 0.75
}

cmd.bindTarget(model)

cmd.stream$.subscribe(x => {
  console.log('action:', x)
  tolCM.updateMaterialBand(viewer, x.obj)
})

cmd.action()
