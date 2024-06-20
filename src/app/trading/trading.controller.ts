import {
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Req,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import * as XLSX from 'xlsx';
import { TICKERS_MAPPINGS } from '../utils/constant';
import { Request } from 'express';
import fetch from 'node-fetch';
import { VnIndex } from '../../schemas/vnindex';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Controller('trading')
export class TradingController {
    constructor(private readonly tradingService: TradingService,
        @InjectModel('VnIndex') private readonly vnIndexModel: Model<VnIndex>,

    ) { }
    @Get('/data')
    async readFileXLSX() {
        try {
            await this.tradingService.downloadCsv();
            const workbook = XLSX.readFile(`/tmp/content.xlsx`);
            const sheet_name_list = workbook.SheetNames;
            const sheet0 = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[0]],
            );
            const sheet1 = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[1]],
            );
            const sheet2 = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[2]],
            );
            const sheet3 = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[3]],
            );
            const formatData = this.tradingService.customRawData(sheet0, sheet1);
            const analyze = Object.keys(sheet3?.[0]);
            const lastKeyAnalyze = analyze?.[analyze.length - 1];
            return {
                // sheet0,
                vn30s: this.tradingService.getInternalData(sheet0),
                formatData,
                external: this.tradingService.getExternalData(sheet0),
                strongest: this.tradingService.getStrongest(sheet0, sheet2),
                weakness: this.tradingService.getWeakness(sheet0, sheet2),
                bot: this.tradingService.mappingBot(sheet3),
                analyze: {
                    key: lastKeyAnalyze,
                    value: sheet3?.[0]?.[lastKeyAnalyze],
                },
                djj: this.tradingService.mappingDJJ(sheet3),
                date: new Date(),
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Something went wrong !');
        }
    }

    @Get('/tickers')
    async getTickers() {
        try {
            return {
                responseData: TICKERS_MAPPINGS(),
            };
        } catch (error) {
            throw new InternalServerErrorException('Something went wrong !');
        }
    }

    @Get('/add-price')
    async addPrice() {
        try {
            return await this.tradingService.addPrice();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/buy')
    async buy(@Req() request: Request) {
        const { query } = request;
        try {
            const buyRes = await this.tradingService.buy(query as any);
            return buyRes;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/get-remaining')
    async getRemainingPrice() {
        try {
            return await this.tradingService.getRemainingPrice();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/crawl')
    async crawlerAll(@Req() request: Request) {
        const { query } = request;
        try {
            const crawl = await this.tradingService.crawlerAll(
                query.tickers as string,
            );
            if (crawl.responseData) {
                return crawl;
            } else {
                return {
                    error: 1,
                    message: 'Crawler fail',
                };
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    @Get('/crawl/:id')
    async crawlerById(@Req() request: Request) {
        const { params } = request;
        try {
            const crawl = await this.tradingService.crawlerDetail(params.id);
            if (crawl.responseData) {
                return crawl;
            } else {
                return {
                    error: 1,
                    message: 'Crawler fail',
                };
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/leader-category')
    async leaderCategory() {
        try {
            const leaders = await this.tradingService.getLeaders();
            return leaders;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/get-buyers')
    async getBuyers() {
        try {
            const buyers = await this.tradingService.getBuyersItem();
            return buyers;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/sell')
    async sell(@Req() request: Request) {
        const { query } = request;
        try {
            const sellRes = await this.tradingService.sell(query as any);
            return sellRes;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/analyze')
    async getPercent() {
        try {
            const percentResp = await this.tradingService.getPercent();
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/get-vnindex')
    async getVNIndex(@Req() req: Request) {
        try {
            const percentResp = await this.tradingService.getVNIndex(req.query);
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/invest-effects')
    async getInvestEffects() {
        try {
            const percentResp = await this.tradingService.getEffects();
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/invest-category')
    async getInvestCategory() {
        try {
            const percentResp = await this.tradingService.getInvestCategory();
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/get-t2/:ticker')
    async getT2(@Req() request: Request) {
        const { params } = request;
        try {
            const histories = await this.tradingService.getT2(params.ticker);
            if (histories.responseData) {
                return histories;
            } else {
                return {
                    error: 1,
                    message: 'Cannot get history',
                };
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/add-today-history')
    async addTodayHistoy() {
        try {
            const leaders = await this.tradingService.addTodayHistory();
            return leaders;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/invest-category/:ticker')
    async getInvestHistoryByTicker(@Req() request: Request) {
        const { params } = request;
        try {
            const percentResp = await this.tradingService.getInvestHistoryByTicker(
                params.ticker as string,
            );
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/strategy/:id/:strategy')
    async updateStrategy(@Req() request: Request) {
        const { params } = request;
        console.log(params);
        try {
            const percentResp = await this.tradingService.updateStrategy(
                params.id,
                params.strategy,
            );
            return percentResp;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/buy-sell-history')
    async getBuySellHistory(@Req() request: Request) {
        const { query } = request;
        try {
            const histories = await this.tradingService.getBuySellHistory(query);
            return histories;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/add-today-vnindex')
    async addTodayVnIndex() {
        try {
            const resp = await fetch('https://api.simplize.vn/api/historical/quote/prices/VNINDEX?type=index&page=0&size=30');
            const today = new Date().getDate();
            const apiData = await resp.json();
            const firstDayOfData = apiData?.data?.[0];
            if (firstDayOfData) {
                if (today === new Date(firstDayOfData.date * 1000).getDate()) {
                    const data = new this.vnIndexModel({
                        closeIndex: firstDayOfData.priceClose,
                        date: new Date().toISOString()
                    }).save();
                    console.log(firstDayOfData);
                    return {
                        responseData: data
                    }
                }
            }
            return {
                responseData: {
                    today,
                    a: today === new Date(firstDayOfData * 1000).getDate(),
                    firstDayOfData
                }
            }

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/vnindexes')
    async getVnIndexes() {
        try {
            const percentResp = await this.vnIndexModel.find();
            return {
                responseData: {
                    responseData: percentResp || [],
                }
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
