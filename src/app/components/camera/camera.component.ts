
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
// import { Game, User, Card } from '../index/Game';
import { Observable } from 'rxjs';
declare var $: any;
declare var WebCamera: any;
declare var dialog: any;
declare var fs: any;
declare var electron: any;


@Component({
    selector: 'app-create',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {

    // Global Declarations will go here
    url = '';
    enabled = false
    value: any
    public singleImage: any
    public carddata: Array<object>;
    public show: Boolean = false;
    imgSrc: any
    openCamera: Boolean = true;
    cameraShot: Boolean = false;
    browseImg: Boolean = false;
    uploadedImg: Boolean = false;
    data2: any;
    file: File;
    imageData: any
    cropperSettings2: CropperSettings;

    @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

    constructor(private cdtaservice: CdtaService, private fb: FormBuilder, private router: Router, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {

        this.cropperSettings2 = new CropperSettings();

        this.cropperSettings2.width = 176;
        this.cropperSettings2.height = 205;

        this.cropperSettings2.keepAspect = false;

        this.cropperSettings2.croppedWidth = 176;
        this.cropperSettings2.croppedHeight = 205;

        this.cropperSettings2.canvasWidth = 200;
        this.cropperSettings2.canvasHeight = 250;

        this.cropperSettings2.minWidth = 176;
        this.cropperSettings2.minHeight = 205;

        this.cropperSettings2.rounded = false;
        this.cropperSettings2.minWithRelativeToResolution = false;

        this.cropperSettings2.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
        this.cropperSettings2.cropperDrawSettings.strokeWidth = 2;
        this.cropperSettings2.noFileInput = true;
        this.data2 = {};
    }

    /** Browse file event */

    fileChangeListener($event) {

        var image: any = new Image();
        this.file = $event.target.files[0];
        var myReader: FileReader = new FileReader();
        var that = this;
        this.browseImg = true
        this.singleImage = '';
        WebCamera.reset();
        this.enabled = false
        this.uploadedImg = false
        myReader.onloadend = function (loadEvent: any) {
            image.src = loadEvent.target.result;
            that.cropper.setImage(image);
            $("#camdemo").remove();

        };
        myReader.readAsDataURL(this.file);
    }

    /** uploading seleted image to server  */

    fileChange() {

        var that = this;
        if (this.data2.hasOwnProperty('image') != "" && this.singleImage == '') {
            this.browseUpload();
        } else if (this.singleImage != "" && this.data2.hasOwnProperty('image') == "") {
            this.cameraUpload();
        }
    }

    /**
     *   upload from browse option
     */
    public browseUpload() {
        let values = {
            imgData: this.data2.image,
            customerId: 10315

        }
        console.log('image', this.data2.image);
        let content = new URLSearchParams()
        content.set('imgData', values.imgData)
        content.set('customerId', values.customerId.toString())

        this.cdtaservice
            .uploadImage(content.toString())    
            .subscribe((data: any) => {
                console.log('final data', data)
                this.browseImg = false;
                this.uploadedImg = true;
                this.imgSrc = 'data:image/png;base64,' + data || 'data:image/jpg;base64,' + data
            });
    }

    /**
     *  upload from camera
     */

    public cameraUpload() {
        let values = {
            imgData: this.singleImage,
            customerId: 10315,
        }
        let content = new URLSearchParams()
        content.set('imgData', values.imgData)
        content.set('customerId', values.customerId.toString())
        this.cdtaservice
            .uploadImage(content.toString())
            .subscribe((data: any) => {
                this.uploadedImg = true
                $("#camdemo").remove();
                this.imgSrc = 'data:image/png;base64,' + data || 'data:image/jpg;base64,' + data
                console.log('final data', data)

            });
    }

    /** Function open camera */

    captureCamera() {

        WebCamera.set('constraints', {
            width: 176,
            height: 205
        });

        this.cameraShot = true
        this.uploadedImg = false
        this.openCamera = false
        this.browseImg = false
        this.singleImage = ''
        this.data2 = {}
        if ($('#camdemo').length <= 0) {
            var iDiv = document.createElement('div');
            iDiv.id = 'camdemo';
            iDiv.style.width = '176px';
            iDiv.style.height = '205px';
            document.getElementById('cameraParent').appendChild(iDiv);
        }

        $('input[type=file]').val(null);

        if (!this.enabled) {
            this.enabled = true;
            WebCamera.attach('#camdemo');

            console.log("The camera has been started");
        } else {
            this.enabled = false;
            WebCamera.reset();
            document.getElementById('camdemo').innerHTML = " ";
            console.log("The camera has been disabled");
        }
    }



    saveImage() {
        // if (this.enabled) {
        // WebCamera.snap(function (data_uri) {
        console.log("checking image", this.singleImage)
        var imageBuffer = this.singleImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = <any>{};
        if (imageBuffer.length !== 3) {
            return new Error('Invalid input string');
        } else {
            response.type = imageBuffer[1];
            response.data = new Buffer(imageBuffer[2], 'base64');
        }
        var savePath = dialog.showSaveDialog({
            filters: [
                { name: 'Images', extensions: ['png'] },
            ]
        });
        fs.writeFile(savePath, response.data, function (err) {
            if (err) {
                console.log("Cannot save the file :'( time to cry !");
            } else {
                alert("Image saved succesfully");
            }
        });
        // });
        // } else {   
        //     console.log("Please enable the camera first to take the snapshot !");
        // }
    }


    takesnapshot() {
        WebCamera.snap((data_uri) => {
            WebCamera.reset();
            this.enabled = false
            this.singleImage = data_uri;
            console.log("takesnap", this.singleImage)
            document.getElementById('camdemo').innerHTML =
                '<img src="' + this.singleImage + '"/>';
        });
    }


    ngOnInit() {

    }

}
