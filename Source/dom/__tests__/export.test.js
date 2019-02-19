/* globals expect, test */
import { Buffer } from 'buffer'
import { isRunningOnJenkins } from '../../test-utils'
import { exportObject, objectFromJSON } from '../export'
import { Shape } from '../layers/Shape'

test('should return exported json data', () => {
  const object = new Shape()
  const archive = exportObject(object, {
    formats: 'json',
    output: false,
  })
  expect(archive.do_objectID).toEqual(String(object.id))
  expect(archive._class).toEqual('shapeGroup')
})

test('should return array of exported json data', () => {
  const objects = [new Shape(), new Shape()]
  const archive = exportObject(objects, {
    formats: 'json',
    output: false,
  })
  expect(archive.length).toBe(2)
  expect(archive[0].do_objectID).toEqual(String(objects[0].id))
  expect(archive[1].do_objectID).toEqual(String(objects[1].id))
})

test('should restore object from json data', () => {
  const object = new Shape()
  const archive = exportObject(object, {
    formats: ['json'],
    output: false,
  })
  const restored = objectFromJSON(archive)
  expect(restored.id).toEqual(String(object.id))
})

test('Should fail with no object provided', () => {
  try {
    exportObject([], {
      output: false,
    })
  } catch (err) {
    expect(err.message).toMatch('No objects provided to export')
  }
})

if (!isRunningOnJenkins()) {
  test('Should return a buffer', (context, document) => {
    const object = new Shape({
      parent: document.selectedPage,
    })
    const buffer = exportObject(object, {
      formats: 'png',
      output: false,
    })
    expect(Buffer.isBuffer(buffer)).toBe(true)
  })
}

test('should fail with to return with multiple formats', () => {
  try {
    const object = new Shape()
    exportObject(object, {
      formats: ['png', 'json'],
      output: false,
    })
    expect(false).toBe(true)
  } catch (err) {
    expect(err.message).toMatch('Can only return 1 format with no output type')
  }
})

test('Should restore shared style', () => {
  const styleJSON =
    '{"_class":"sharedStyle","do_objectID":"F5E30A31-048F-49AB-82DA-2EFB65C01E5F","name":"Rectangle Style","value":{"_class":"style","borders":[{"_class":"border","isEnabled":false,"color":{"_class":"color","alpha":1,"blue":0.592,"green":0.592,"red":0.592},"fillType":0,"position":1,"thickness":1}],"endMarkerType":0,"fills":[{"_class":"fill","isEnabled":true,"color":{"_class":"color","alpha":1,"blue":0.8955275153082571,"green":0.9697066326530612,"red":0.2686359796345148},"fillType":0,"noiseIndex":0,"noiseIntensity":0,"patternFillType":0,"patternTileScale":1}],"miterLimit":10,"startMarkerType":0,"windingRule":1}}'

  const object = objectFromJSON(JSON.parse(styleJSON), 112)
  expect(object.type).toBe('SharedStyle')
  expect(object.style.styleType).toBe('Layer')
  expect(String(object.styleType)).toBe('3')
  expect(object.id).toEqual('F5E30A31-048F-49AB-82DA-2EFB65C01E5F')
})
