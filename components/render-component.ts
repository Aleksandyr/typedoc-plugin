import { Component, RendererComponent } from 'typedoc/dist/lib/output/components';
import { Renderer } from 'typedoc/dist/lib/output/renderer';
import { RendererEvent, MarkdownEvent } from 'typedoc/dist/lib/output/events';
import * as fs from 'fs';
import { MarkedPlugin } from 'typedoc/dist/lib/output/plugins';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import { Options } from 'typedoc/dist/lib/utils/options';
import { DiscoverEvent } from 'typedoc/dist/lib/utils/options/options';

@Component({ name: 'render-component'})
export class RenderComponenet extends RendererComponent {
    currentFd = null;
    fileContents = {}
    public initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRenderBegin,
            [RendererEvent.END]: this.onRenderEnd,
            // [MarkdownEvent.PARSE]: this.onMarkdownParse
        })
    }

    private onRenderBegin(event: RendererEvent) {

        // const options: Options = this.application.options;
        // if(options.getRawValues().generate) {
        //     this.runCommentGeneration(event);
        //     event.preventDefault();
        // } else {
        //     // console.log('Not generate');
        // }
    }

    private runCommentGeneration(event: RendererEvent) {
        if(!this.currentFd) {
            this.currentFd = fs.openSync('test.json', 'w+');
        }

        const keys = Object.keys(event.project.reflections)
        for (let key of keys){
            const reflection = event.project.reflections[key];
            this.addTOJson(reflection)
        }

        fs.writeSync(this.currentFd, JSON.stringify(this.fileContents));
    }

    private addTOJson(reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
                this.fileContents[reflection.sources[0].file.fullFileName] = {}
                break;
            case ReflectionKind.Property: 
            case ReflectionKind.CallSignature:
                this.fileContents[reflection.parent.sources[0].file.fullFileName][reflection.name] = reflection.comment.shortText;
                break;
            default:
                return;
        }
    }

    private onRenderEnd(event: RendererEvent) {
        // if(!!this.currentFd) {
        //     fs.closeSync(this.currentFd);
        //     this.currentFd = null;
        // }        

        // const fileContent = fs.readFileSync('test.json', 'utf8');
    }

    // private onMarkdownParse(...rest) {

    // }
}