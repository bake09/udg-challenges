<template>
  <q-page class="q-pa-sm">
    <q-card :class="$q.screen.gt.md ? 'fullHeightBig' : 'fullHeightSmall'">

      <q-card-section v-show="$q.screen.gt.xs">
        <div class="text-h4 text-center text-pacifico text-primary">Pixel-Art</div>
      </q-card-section>

      <q-card-section>
        <div class="row flex col constrain">
          <div class="col-4 column">
            <span class="text-caption"><q-icon name="las la-border-all"></q-icon> Gridgröße</span>
            <q-select outlined v-model="selectedGrid" :options="gridOptions" dense/>
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

      <q-card-section style="z-index:1;">
        <div class="row flex col justify-center full-width q-gutter-xs">
          <span class="text-caption full-width text-center"><span class="q-px-lg" style="background: rgb(255 255 255 / 70%);"><q-icon name="las la-palette"></q-icon> Palette</span></span>
          <q-btn round v-for="item in colorOptions" :key="item" size="md" :color="item" @click="setColor(item)" class="shadow-10"/>
        </div>
      </q-card-section>
      
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
            :style="`width:${canvasWidth}px; height:${canvasHeight}px; position:absolute; top:16; left:16;`"
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
import { date } from 'quasar'

export default {
  name: 'PagePixelart2',
  data() {
    return {
      canvas: null,
      ctx: null,
      canvasWidth: 300,
      canvasHeight: 300,
      isDrawing: false,
      fillArray: [],
      selectedPaintTool: 'brush',
      selectedColor: 'black',
      colorOptions: ['black', 'grey', 'brown', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'white'],
      selectedGrid: '8x8',
      gridOptions: [
        '8x8', '12x12', '16x16', '32x32'
      ]
    }
  },
  computed: {
    returnRowAndCellsQuantity(){
      return parseInt(this.selectedGrid.split("x")[0])
    },
    returnCellSize(){
      return this.canvasWidth/this.returnRowAndCellsQuantity
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
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext("2d")
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasHeight
    },
    setColor(color){
      this.selectedColor = color
    },
    createInitialEmptyFillArray(){
      // Empty existing Array
      if(this.fillArray.length){ 
        this.fillArray = []
      }
      // Populate Array initially
      for(let i = 0; i < this.returnRowAndCellsQuantity; i++){
        let cellsArray = []
        for(let j = 0; j < this.returnRowAndCellsQuantity; j++){
          cellsArray.push('white')
        }
        this.fillArray.push(cellsArray)
      }
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx = this.canvas.getContext("2d")
    },
    drawInitialCanvasByGivenGridSelection()
    {
      for(let row = 0; row < this.returnRowAndCellsQuantity; row++)
      {
        for(let col = 0; col < this.returnRowAndCellsQuantity; col++)
        {
          let x = col * this.returnCellSize;
          let y = row * this.returnCellSize;

          this.ctx.fillStyle = 'rgba(255,255,255,1)'
          this.ctx.fillRect(x, y, this.returnCellSize, this.returnCellSize)
        }
      }
    },
    handleDraw(layerX, layerY, eventtype){
      if(this.isDrawing){
        const row = Math.floor( layerY / this.returnCellSize )
        const col = Math.floor( layerX / this.returnCellSize )

        const x = col * this.returnCellSize
        const y = row * this.returnCellSize

        let rowIndex =  y/this.returnCellSize
        let cellIndex = x/this.returnCellSize

        if(this.selectedPaintTool == "brush"){
          this.fillArray[rowIndex][cellIndex] = this.selectedColor
          this.fillSingleCell(x, y, this.selectedColor)
        }else{
          if(this.fillArray[rowIndex][cellIndex] != this.selectedColor){
            this.performFloodFill(row, col, this.fillArray[rowIndex][cellIndex], this.selectedColor)
            // Update View by calling Fill-Stack
            setTimeout(() => {
              this.drawEntireCanvasByArray()
            }, 30);
          }
        }
      }
    },
    handleDrawByClick(e){
      if(this.isDrawing){
        const row = Math.floor( e.layerY / this.returnCellSize )
        const col = Math.floor( e.layerX / this.returnCellSize )

        const x = col * this.returnCellSize
        const y = row * this.returnCellSize

        let rowIndex =  y/this.returnCellSize
        let cellIndex = x/this.returnCellSize

        if(this.selectedPaintTool == "brush"){
          this.fillArray[rowIndex][cellIndex] = this.selectedColor
          this.fillSingleCell(x, y, this.selectedColor)
        }else{
          if(this.fillArray[rowIndex][cellIndex] != this.selectedColor){
            this.performFloodFill(row, col, this.fillArray[rowIndex][cellIndex], this.selectedColor)
            // Update View by calling Fill-Stack
            setTimeout(() => {
              this.drawEntireCanvasByArray()
            }, 30);
          }
        }
      }
    },
    fillSingleCell(x, y, color){
      this.ctx.fillStyle = color
      this.ctx.fillRect(x, y  , this.returnCellSize, this.returnCellSize)
    },
    drawEntireCanvasByArray(){
      // let testArray = [
      //   ['black', 'red', 'black', 'red', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'blue', 'blue',]
      // ]
      
      // Draw entire Array with cell Position Faktor(canvas.length/Count of Cells)
      let posFaktor = this.canvas.width / this.returnRowAndCellsQuantity

      for(let row = 0; row < this.returnRowAndCellsQuantity; row++){
        for(let cell = 0; cell < this.returnRowAndCellsQuantity; cell++){
          this.fillSingleCell(row * posFaktor, cell * posFaktor, this.fillArray[cell][row])
          // this.fillSingleCell(row * posFaktor, cell * posFaktor, testArray[cell][row])
        }
      }
    },
    performFloodFill(i, j, oldColor, newColor) {

      // https://www.codeguru.co.in/2021/10/flood-fill-algorithm-in-javascript.html

      // const map = [
      //   ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '#', '-', '-', '-', '-', '#'],
      //   ['#', '#', '#', '-', '-', '-', '#', '#', '#'],
      //   ['#', '-', '-', '-', '-', '#', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
      // ];

      // Check the boundary condition
      if (i < 0 || i >= this.fillArray.length || j < 0 || j >= this.fillArray[i].length) return;
      if (this.fillArray[i][j] !== oldColor) return;

      // set the color of node to newColor
      this.fillArray[i][j] = newColor;

      // Look for neighboring cell
      this.performFloodFill(i + 1, j, oldColor, newColor);
      this.performFloodFill(i - 1, j, oldColor, newColor);
      this.performFloodFill(i, j + 1, oldColor, newColor);
      this.performFloodFill(i, j - 1, oldColor, newColor);

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

