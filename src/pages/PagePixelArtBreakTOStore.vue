<template>
  <q-page class="q-pa-sm">
    <q-card :class="$q.screen.gt.md ? 'fullHeightBig' : 'fullHeightSmall'">

      <!-- Section-Heading (only showing if above SmallScreens)-->
      <q-card-section v-show="$q.screen.gt.xs">
        <div class="text-h4 text-center text-pacifico text-primary">Pixel-Art</div>
      </q-card-section>

      <!-- Section-Toolbar (gridSelection and Choose-Brush-Type 'brush/fill')-->
      <q-card-section>
        <div class="row flex col constrain">
          <div class="col-4 column">
            <span class="text-caption"><q-icon name="las la-border-all"></q-icon> Gridgröße</span>
            <q-select outlined v-model="selectedGrid" :options="getGridOptions" dense/>
          </div>
          <div class="col-8 column items-end">
            <span class="text-caption"><q-icon name="las la-brush"></q-icon> Auswahl</span>
            <q-btn-toggle
              v-model="selectedPaintTool"
              push
              glossy
              color="grey-5"
              :toggle-color="selectedColor"
              :options="[
                {value: 'brush', slot: 'one'},
                {value: 'fill', slot: 'two'},
              ]"
            >
              <template v-slot:one>
                  <q-icon right name="las la-paint-brush" />
              </template>

              <template v-slot:two>
                  <q-icon right name="las la-fill-drip" />
              </template>
            </q-btn-toggle>
          </div>
        </div>
      </q-card-section>

      <!-- Section-ColorPallete -->
      <q-card-section style="z-index:1;">
        <div class="row flex col justify-center full-width q-gutter-xs">
          <span class="text-caption full-width text-center"><span class="q-px-lg" style="background: rgb(255 255 255 / 70%);"><q-icon name="las la-palette"></q-icon> Palette</span></span>
          <q-btn
            v-for="item in getColorOptions"
            :key="item"
            :color="item"
            @click="setColor(item)"
            class="shadow-10"
            size="md"
            round
          />
        </div>
      </q-card-section>
      
      
      <!-- Section-Canvas (including, Canvas, Overlay for Griddisplay, BackgroundImage)-->
      <q-card-section style="position:relative;">
        <div class="row flex col canvascontainer shadow-3">
          <img src="canvasbg.png" id="bg">
          <canvas 
            class="mycanvas"
            ref="canvas" 
            @touchstart="isDrawing = true"
            @touchend="isDrawing = false"
            @mousedown="isDrawing = true"
            @mouseup="isDrawing = false"
          />
          <div
            class="flex rasterDiv"
            :style="`width:${getCanvasWidthAndHeight}px; height:${getCanvasWidthAndHeight}px; position:absolute; top:16; left:16;`"
          >
            <div class="rasterRow" v-for="row in returnRowAndCellsQuantity" :key="row">
              <div
                v-for="cell in returnRowAndCellsQuantity"
                :key="cell"
                :style="`width:${returnCellSize}px; height:${returnCellSize}px;`"
                class="rasterColumn rasterborder"
              />
            </div>
          </div>
        </div>
      </q-card-section>
      
      <!-- FloatingActionButton (save Image in different Formats, .jpg, .png, .gif)-->
      <q-page-sticky position="bottom-right" :offset="[18, 18]" style="z-index: 3;">
        <q-fab color="indigo-8" icon="save" direction="left" vertical-actions-align="center">
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('jpg')" icon="image" label=".jpg"/>
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('png')" icon="image" label=".png"/>
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('gif')" icon="image" label=".gif"/>
        </q-fab>
      </q-page-sticky>
    </q-card>
  </q-page>
</template>

<script>
// import { date } from 'quasar'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'PagePixelart',
  computed: {
      // ...mapGetters("pixel", ["getSelectedGrid"]),
    ...mapGetters("pixel", ["getGridOptions"]),
    ...mapGetters("pixel", ["getColorOptions"]),
    ...mapGetters("pixel", ["getCanvasWidthAndHeight"]),
    ...mapGetters("pixel", ["returnRowAndCellsQuantity"]),
    ...mapGetters("pixel", ["returnCellSize"]),
    // ...mapGetters("pixel", ["canvas"]),
    // ...mapGetters("pixel", ["ctx"]),
    // ...mapGetters("pixel", ["fillArray"]),
    selectedGrid: {
      get(){
        return this.$store.getters['pixel/getSelectedGrid']
      },
      set(newValue){
        this.$store.dispatch('pixel/setSelectedGrid', newValue)
      }
    },
    selectedPaintTool: {
      get(){
        return this.$store.getters['pixel/getSelectedPaintTool']
      },
      set(newValue){
        this.$store.dispatch('pixel/setSelectedPaintTool', newValue)
      }
    },
    selectedColor: {
      get(){
        return this.$store.getters['pixel/getSelectedColor']
      },
      set(newValue){
        this.$store.dispatch('pixel/setSelectedColor', newValue)
      }
    },
    isDrawing: {
      get(){
        return this.$store.getters['pixel/getIsDrawing']
      },
      set(newValue){
        this.$store.dispatch('pixel/setIsDrawing', newValue)
      }
    },
    canvas: {
      get(){
        return this.$store.getters['pixel/canvas']
      },
      set(newValue){
        this.$store.dispatch('pixel/setCanvas', newValue)
      }
    },
    ctx: {
      get(){
        return this.$store.getters['pixel/ctx']
      },
      set(newValue){
        this.$store.dispatch('pixel/setCtx', newValue)
      }
    },
    fillArray: {
      get(){
        return this.$store.getters['pixel/fillArray']
      },
      set(newValue){
        this.$store.dispatch('pixel/setFillArray', newValue)
      }
    }
  },
  mounted() {
    this.createCanvasReference()

    this.drawInitialCanvasByGivenGridSelection()
    this.createInitialEmptyFillArray()

    this.handleTouching()
    this.handleMouseMoving()
    this.handleMouseClick()

  },
  watch: {
    selectedGrid(){
      this.clearCanvas()
      this.createInitialEmptyFillArray()
      this.drawInitialCanvasByGivenGridSelection()
    }
  },
  methods: {
    createCanvasReference(){
      this.$store.dispatch('pixel/createCanvasReference', this.$refs.canvas)
    },
    setColor(color){
      this.selectedColor = color
    },
    createInitialEmptyFillArray(){
      this.$store.dispatch('pixel/createInitialEmptyFillArray')
    },
    clearCanvas() {
      this.$store.dispatch('pixel/setClearCanvas')
    },
    drawInitialCanvasByGivenGridSelection()
    {
      this.$store.dispatch('pixel/setDrawInitialCanvasByGivenGridSelection')
    },
    handleDraw(layerX, layerY, eventtype){
      this.$store.dispatch('pixel/setHandleDraw', layerX, layerY, eventtype)
    },
    handleDrawByClick(e){
      this.$store.dispatch('pixel/setHandleDrawByClick', e)
    },
    fillSingleCell(x, y, color){
      this.$store.dispatch('pixel/setFillSingleCell', x, y, color)
    },
    drawEntireCanvasByArray(){
      this.$store.dispatch('pixel/setDrawEntireCanvasByArray')
    },
    performFloodFill(i, j, oldColor, newColor) {
      this.$store.dispatch('pixel/setPerformFloodFil', i, j, oldColor, newColor)
    },
    shareOrSaveAsImage(format){
      // 3. create dynamic Filename for the export
      let timeStamp = Date.now()
      let formattedString = date.formatDate(timeStamp, 'DD_MM_YYYY_HH_mm_ss')
      let filename = `UDG_MyPixelArt_${formattedString}`

      const link = document.createElement("a")
      link.setAttribute("download", `${filename}.${format}`)
      link.setAttribute(
        "href",
        this.canvas
          .toDataURL(`image/${format}`)
          .replace(`image/${format}`, "image/octet-stream")
      );
      link.click()
    },
    handleTouching(){
      this.canvas.addEventListener('touchmove', (e) => { 
        let eventtype = e.type
        let topdistance = this.canvas.getBoundingClientRect().top
        let leftdistance = this.canvas.getBoundingClientRect().left
        let row = e.changedTouches[0].clientX - leftdistance
        let col = e.changedTouches[0].clientY - topdistance

        this.handleDraw(row, col, eventtype)
      }, {passive: true})
    },
    handleMouseMoving(){
      this.canvas.addEventListener('mousemove', (e) => { 
        let eventtype = e.type
        let row = e.layerX
        let col = e.layerY
        this.handleDraw(row, col, eventtype)
      })
    },
    handleMouseClick(){
      this.canvas.addEventListener('click', (e) => { 
        
        this.isDrawing = true
        
        let eventtype = e.type
        let row = e.layerX
        let col = e.layerY
        this.handleDraw(row, col, eventtype)

        this.isDrawing = false
      })
    }
  }
}
</script>

<style scoped>

.constrain {
  max-width: 980px;
  margin: 0 auto;
}

.canvascontainer{
  max-width: 300px;
  margin: 0 auto;
  position: relative;
}
.mycanvas{
  width: 100%;
  height: auto;
  z-index:1; 
  opacity:0.9;
}
.rasterborder{
  border: 1px solid #53617499;
}
#bg {
  position: absolute;
  top: 4px;
  transform: scale(1.72);
  left: 64px;
}
</style>

