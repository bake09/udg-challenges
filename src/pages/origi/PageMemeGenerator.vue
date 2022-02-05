<template>
  <q-page class="q-pa-sm">
    <q-card :class="$q.screen.gt.md ? 'fullHeightBig' : 'fullHeightSmall'">

      <q-card-section v-show="$q.screen.gt.xs"  class="my-q-card">
        <div class="text-h4 text-center text-pacifico text-primary">Meme Generator</div>
      </q-card-section>

      <q-card-section class="q-pt-none my-q-card">
        <div class="row flex col justify-center">
          <div class="col-md-6">
            <div class="q-px-md canvascontainer">
              <canvas ref="canvas" class="mycanvas shadow-2" style="border: 5px dashed gray;"></canvas>
            </div>
          </div>
          
          <div class="flex col column q-gutter-y-md q-px-md col-sm-10 col-md-6 col-12">
            
            <div class="row">
              <q-btn :label="fileName ? fileName : 'Bild hochladen'" icon="upload" no-caps style="cursor: pointer;" color="accent">
                <input title="" type="file" ref="fileInput" @input="onSelectFile" style="opacity: 0; position: absolute; width:100%; height:100%; cursor: pointer !important;" accept=".png, .jpg, .jpeg">
              </q-btn>
            </div>
        
            <div class="row">
              <div class="col-7">
                <q-input
                  v-model="topText"
                  class="textarea q-mt-none"
                  label="Text oben"
                  ref="topTextRef"
                  rows="3"
                  type="textarea"
                  dense
                  outlined
                />
                
                <q-slider
                  v-model="topTextSelectedFontSize"
                  color="primary"
                  :inner-min="6"
                  :inner-max="10"
                  :step="1"
                  markers
                  :marker-labels="topTextFontSizes"
                  label
                  label-value="Textgröße"
                  switch-label-side
                  switch-marker-labels-side
                  :min="6"
                  :max="10"
                />
              </div>
              
              <div class="col-5 q-pl-xs">

                <q-select
                  dense
                  filled
                  v-model="topTextSelectedFont"
                  :options="topTextFonts"
                  label="Textart"
                  style="min-width:130px;"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label><span :style="`font-family: ${scope.opt}`">{{ scope.opt }}</span></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <div class="row justify-between q-pt-xs">

                <q-toggle
                  dense
                  v-model="topTextUppercase"
                  :label="topTextUppercase ? 'GROSS' : 'klein'"
                />

                <q-btn
                  dense
                  :style="`background-color: ${topTextSelectedColor}`"
                  :text-color="topTextDarker ? 'white' : 'black'" 
                  icon="colorize"
                  label=""
                  no-caps
                  >
                  <q-menu refs="colorMenu">
                    <q-color 
                      v-model="topTextSelectedColor"
                      class="my-picker"
                      v-close-popup
                      no-header
                      no-footer 
                    ></q-color>
                  </q-menu>
                </q-btn>

                </div>  
              </div>
            </div>
            
            <q-separator />

            <div class="row">
              <div class="col-7">
                <q-input
                  v-model="bottomText"
                  class="textarea q-mt-none"
                  label="Text unten (max. 3 Zeilen)"
                  rows="3"
                  type="textarea"
                  dense
                  outlined
                />
                
                <q-slider
                  v-model="bottomTextSelectedFontSize"
                  color="primary"
                  :inner-min="6"
                  :inner-max="10"
                  :step="1"
                  markers
                  :marker-labels="bottomTextFontSizes"
                  label
                  label-value="Textgröße"
                  switch-label-side
                  switch-marker-labels-side
                  :min="6"
                  :max="10"
                />
              </div>

              <div class="col-5 q-pl-xs">

                <q-select
                  dense
                  filled
                  v-model="bottomTextSelectedFont"
                  :options="bottomTextFonts"
                  label="Textart"
                  style="min-width:130px;"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label><span :style="`font-family: ${scope.opt}`">{{ scope.opt }}</span></q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <div class="row justify-between q-pt-xs">

                  <q-toggle
                    dense
                    v-model="bottomTextUppercase"
                    :label="bottomTextUppercase ? 'GROSS' : 'klein'"
                  />

                  <q-btn
                    dense
                    :style="`background-color: ${bottomTextSelectedColor}`"
                    :text-color="bottomTextDarker ? 'white' : 'black'" 
                    icon="colorize"
                    label=""
                    no-caps
                    >
                    <q-menu refs="colorMenu">
                      <q-color 
                        v-model="bottomTextSelectedColor"
                        class="my-picker"
                        v-close-popup
                        no-header
                        no-footer 
                      ></q-color>
                    </q-menu>
                  </q-btn>

                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="indigo-8" icon="save" direction="up" vertical-actions-align="center">
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('jpg')" icon="image" label=".jpg" />
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('png')" icon="image" label=".png" />
          <q-fab-action label-position="right" color="primary" @click="shareOrSaveAsImage('gif')" icon="image" label=".gif" />
        </q-fab>
      </q-page-sticky>

    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { colors } from 'quasar'
import { date } from 'quasar'

export default defineComponent ({
  name: 'PageMemeGenerator',
  data() {
    return {
      isCustomImageSelected: false,
      image: null,
      imageData: null,
      fileName: '',
      canvas: null,
      ctx: null,

      topText: '',
      topTextbyLines: [],
      topTextSectionOffset: null,
      topTextSelectedColor: '#00fff7',
      topTextDarker: false,
      topTextFonts: ['Arial', 'Comic Sans', 'Pacifico'],
      topTextSelectedFont: 'Pacifico',
      topTextUppercase: false,
      topTextSelectedFontSize: 7,
      topTextFontSizes: [
        { value: 6, label: 'xs'},
        { value: 7, label: 'sm'},
        { value: 8, label: 'md'},
        { value: 9, label: 'lg'},
        { value: 10, label: 'xl'}
      ],
      topTextGeneratedStrokeColor: 'black',

      bottomText: '',
      bottomTextbyLines: [],
      bottomTextSectionOffset: null,
      bottomTextSelectedColor: '#ff00ea',
      bottomTextDarker: true,
      bottomTextFonts: ['Arial', 'Comic Sans', 'Pacifico'],
      bottomTextSelectedFont: 'Arial',
      bottomTextUppercase: true,
      bottomTextSelectedFontSize: 8,
      bottomTextFontSizes: [
        { value: 6, label: 'xs'},
        { value: 7, label: 'sm'},
        { value: 8, label: 'md'},
        { value: 9, label: 'lg'},
        { value: 10, label: 'xl'}
      ],
      bottomTextGeneratedStrokeColor: 'white',
      bottomTextYoffset: 8
    }
  },
  watch: {
    topTextSelectedColor(){
      this.updateTop()
      this.updateText()
    },
    topTextSelectedFont(){
      this.updateText()
    },
    topTextSelectedFontSize(){
      this.updateText()
    },
    bottomTextSelectedColor(){
      this.updateBottom()
      this.updateText()
    },
    bottomTextSelectedFont(){
      this.updateText()
    },
    bottomTextSelectedFontSize(){
      this.updateText()
    },
    topText(){
      this.topTextbyLines = this.topText.split(/\r?\n/)
    },
    topTextbyLines() {
      this.updateText()
    },
    topTextUppercase() {
      this.updateText()
    },
    bottomTextUppercase() {
      this.updateText()
    },
    bottomText(){
      this.bottomTextbyLines = this.bottomText.split(/\r?\n/)
    },
    bottomTextbyLines() {
      if(this.bottomTextbyLines.length == 1){
        this.bottomTextYoffset = 8
      }
      if(this.bottomTextbyLines.length == 2){
        this.bottomTextYoffset = 4.2
      }
      if(this.bottomTextbyLines.length == 3){
        this.bottomTextYoffset = 2.8
      }
      this.updateText()
    },
  },
  mounted() {
    this.initialFile()
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext("2d")
    setTimeout(() => {
      this.$refs.topTextRef.focus()
    }, 30);
  },
  methods: {
    async initialFile() {
      let blobData = null
      await fetch("http://localhost:8080/img/initMeme.png")
      .then(r => {
         return r.blob();
      }).then(blob => {
        blobData = blob
      });

      this.imageData = URL.createObjectURL(blobData)
      this.renderImage(this.$refs.canvas, this.imageData)
      setTimeout(() => {
        this.topText = `Es gibt immer
zwei Meinungen`
        this.bottomText = "Meine und die Falsche!"
      }, 30);
    },
    onSelectFile() {
      const input = this.$refs.fileInput
      const files = input.files[0]
      console.log('files :>> ', files);
      
      this.fileName = files.name
      this.imageData = URL.createObjectURL(files)

      this.renderImage(this.$refs.canvas, this.imageData)
    },
    renderImage(canvas, blob) {
      const ctx = this.ctx
      canvas.width = 1920
      canvas.height = 1080

      const imgObj = new Image()
      imgObj.onload = (event) => {
        let w = canvas.width
        let nw = imgObj.naturalWidth
        let nh = imgObj.naturalHeight
        let aspect = nw / nh
        let h = w / aspect
        canvas.height = h
        
        // assign Image to Canvas for first preview
        ctx.drawImage(imgObj, 0, 0, w, h)
        this.updateText()
        
      }
      imgObj.src = blob
      this.image = imgObj
    },
    updateText() {
      const ctx = this.ctx
      const width = this.canvas.width
      const height = this.canvas.height

      const fontSizeTop = Math.floor(height * `${this.topTextSelectedFontSize}`/80)
      const fontSizeBottom = Math.floor(height * `${this.bottomTextSelectedFontSize}`/80)
      let yOffsetTop = height / 20
      let yOffsetBottom = height / this.bottomTextYoffset // 1 = 8, 2 = 4.2, 3 = 2.8
      // assign Image to Canvas
      ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)

      this.topTextbyLines.forEach(item => {
        item = this.topTextUppercase ? item.toUpperCase() : item 
        // Prepare TOP-text
        ctx.strokeStyle = this.topTextGeneratedStrokeColor
        ctx.lineWidth = Math.floor(fontSizeTop / 8) // ctx.lineWidth = Math.floor(fontSize / 4)
        ctx.fillStyle = this.topTextSelectedColor
        ctx.textAlign = "center"
        ctx.lineJoin = "round"
        ctx.font = `${fontSizeTop}px ${this.topTextSelectedFont}`
        // Add top text
        ctx.textBaseline = "top"
        ctx.strokeText(item, width / 2, yOffsetTop)
        ctx.fillText(item, width / 2, yOffsetTop)
        // Important for Lineheight offset when multilineText
        yOffsetTop = yOffsetTop+(fontSizeTop*1.2)

        // let metrics = ctx.measureText("ÜgGj");
        // let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        // let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        // console.log('metrics :>> ', metrics)
        // console.log('fontHeight :>> ', fontHeight)
        // console.log('actualHeight :>> ', actualHeight);
        
      })


      this.bottomTextbyLines.forEach(item => {
        item = this.bottomTextUppercase ? item.toUpperCase() : item
        // Prepare Bottom-text
        ctx.strokeStyle = this.bottomTextGeneratedStrokeColor
        ctx.lineWidth = Math.floor(fontSizeBottom / 8)
        ctx.fillStyle = this.bottomTextSelectedColor
        ctx.textAlign = "center"
        ctx.lineJoin = "round"
        ctx.font = `${fontSizeBottom}px ${this.bottomTextSelectedFont}`
        // Add bottom text
        ctx.textBaseline = "top"
        ctx.strokeText(item, width / 2, height - yOffsetBottom)
        ctx.fillText(item, width / 2, height - yOffsetBottom)
        // Important for Lineheight offset when multilineText
        yOffsetBottom = yOffsetBottom-(fontSizeBottom*1.2)
      })

    },
    updateTop () {
      if(colors.luminosity(this.topTextSelectedColor) >= 0.4){
       this.topTextDarker = false
       this.topTextGeneratedStrokeColor = "black"
      }else{
       this.topTextDarker = true
       this.topTextGeneratedStrokeColor = "white"
      }
    },
    updateBottom() {
      if(colors.luminosity(this.bottomTextSelectedColor) >= 0.4){
       this.bottomTextDarker = false
       this.bottomTextGeneratedStrokeColor = "black"
      }else{
       this.bottomTextDarker = true
       this.bottomTextGeneratedStrokeColor = "white"
      }
    },
    shareOrSaveAsImage(format){
      
      // create dynamic Filename for the export
      let timeStamp = Date.now()
      let formattedString = date.formatDate(timeStamp, 'DD_MM_YYYY_HH_mm_ss')
      let filename = `UDG_Meme_${formattedString}`

      const link = document.createElement("a")
      link.setAttribute("download", `${filename}.${format}`)
      link.setAttribute(
        "href",
        this.canvas
          .toDataURL(`image/${format}`)
          .replace(`image/${format}`, "image/octet-stream")
      );
      link.click()
    }
  }
})
</script>

<style>

.canvascontainer {
  max-width: 600px;
  margin: 0 auto;
}

.mycanvas {
  width: 100%;
  height: auto;
}

.textarea{
  resize: none !important;
  white-space: normal;
  text-align: justify;
  -moz-text-align-last: center;
  text-align-last: center;
}

.q-textarea.q-field--dense.q-field--labeled .q-field__native {
  resize: none;
}

.my-q-card {
  padding: 16px 0px;
}

.q-slider__marker-labels--h-ltr:first-child{
  transform: translateX(0%)
}

.q-slider__marker-labels--h-ltr:last-child {
  transform: translateX(-100%)
}

.q-slider__track-container--h {
  padding: 2px 0;
}
</style>