import { Component, RendererComponent } from 'typedoc/dist/lib/output/components';
import { Renderer } from 'typedoc/dist/lib/output/renderer';
import { RendererEvent, MarkdownEvent } from 'typedoc/dist/lib/output/events';
import * as fs from 'fs';
import * as path from 'path';
import { MarkedPlugin } from 'typedoc/dist/lib/output/plugins';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import { Options } from 'typedoc/dist/lib/utils/options';
import { DiscoverEvent } from 'typedoc/dist/lib/utils/options/options';
import { FileOperations } from '../utils/file-operations';
import { JSONObjectKind } from '../utils/enums/json-obj-kind';

const MAIN_DIR = 'exports';

@Component({ name: 'render-component'})
export class RenderComponenet extends RendererComponent {
    fileOperations: FileOperations;
    data: JSON;

    public initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRenderBegin,
            [RendererEvent.END]: this.onRenderEnd,
        });
        
        this.fileOperations = new FileOperations(this.application.logger);
    }

    private onRenderBegin(event: RendererEvent) {        
        const reflections = event.project.reflections;
        this.runCommentReplacements(reflections);
    }

    private runCommentReplacements(reflections) {
        const keys = Object.keys(reflections);
        keys.forEach(key => {
            const reflection = reflections[key];
            this.processTheReflection(reflection);
        });
    }

    private processTheReflection(reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Class:
                const filePath = reflection.sources[0].fileName;
                const parsePath = path.parse(filePath);
                const exportPath = `${MAIN_DIR}\\${this.fileOperations.getDirToExport(parsePath)}`;
                if(this.fileOperations.ifDirectoryExists(exportPath)) {
                    const jsonFilePath = `${exportPath}\\${reflection.name}.json`
                    if (this.fileOperations.ifFileExists(jsonFilePath)) {
                        const data = this.fileOperations.getFileJSONData(exportPath, reflection.name);
                        if (data) {
                            this.data = data;
                            if (reflection.comment) {
                                reflection.comment.shortText = data[reflection.name]['comment'];
                            }
                        }
                    }
                }
                break;
            case ReflectionKind.Property:
                    const parentName = reflection.parent.name;
                    const propertyName = reflection.name;
                    if (this.data && this.data[parentName]) {
                        const propertyData = this.data[parentName][JSONObjectKind[ReflectionKind.Property]][propertyName];
                        if(propertyData) {
                            reflection.comment.shortText = propertyData;
                        }
                    }
                break;
            default:
                return;
        }
    }


    private onRenderEnd(event: RendererEvent) {
        console.log(event);
    }

}