import { Card, CardBody, Tab, Tabs } from '@nextui-org/react'
import React from 'react'

const ProductContent: React.FC = () => {
    return (
        <section className='bg-skin-white p-10 rounded-2.5xl shadow-card space-y-7.5'>
            <div className="flex w-full flex-col">
                <Tabs aria-label="Options"
                    variant='bordered'
                    color='primary'
                    classNames={{
                        base: "mb-5",
                        tabList: "gap-3 px-5 py-4 mx-auto border border-skin-neutral-100 rounded-xl !bg-skin-base",
                        cursor: "bg-primary-gradient-100 border-none text-skin-white rounded-lg shadow-md",
                        tab: "rounded-lg min-w-[124px] h-10 border border-skin-primary2-500 text-skin-primary2-500 group-data-[selected=true]:!border-none",
                        tabContent: "group-data-[selected=true]:!text-skin-white  text-title-2 font-semibold",
                    }}
                >
                    <Tab key="Description" title="Description">
                        <Card classNames={{
                            base: "!bg-none"
                        }}>
                            <CardBody className='!bg-none'>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="Delivery" title="Delivery">
                        <Card>
                            <CardBody>
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                                ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                cillum dolore eu fugiat nulla pariatur.
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="Reviews" title="Reviews">
                        <Card>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </section>
    )
}

export default ProductContent