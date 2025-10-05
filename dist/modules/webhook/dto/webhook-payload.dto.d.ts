export declare class WebhookPayloadDto {
    event_log?: string;
    [key: string]: any;
}
export declare class HikvisionEventDto {
    serialNo?: number;
    eventType?: string;
    macAddress?: string;
    ipAddress?: string;
    channelID?: number;
    AccessControllerEvent?: {
        serialNo?: number;
        deviceName?: string;
        employeeNoString?: string;
        name?: string;
        cardNo?: string;
        statusValue?: number;
    };
}
