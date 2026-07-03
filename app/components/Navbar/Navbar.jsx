"use client";

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/react";
import { PiHamburger } from "react-icons/pi";

export default function App() {
    return (
        <div className="">
            <Navbar shouldHideOnScroll className="bg-transparent">
                <NavbarBrand>
                    <Button as={Link} color="warning" href="/" variant="light">
                        Placement Tales
                    </Button>
                </NavbarBrand>
                <NavbarContent className="hidden md:flex gap-4" justify="center">
                    <NavbarItem>
                        <Button as={Link} color="default" href="/" variant="shadow">
                            Features 🚨
                        </Button>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Button as={Link} color="success" href="add-student" variant="light">
                            Contribute! 🚀
                        </Button>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Button as={Link} color="success" href="browse" variant="light">
                            Browse
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="default" href="/feature-request" variant="light">
                            Feature Request
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="default" href="/bug-report" variant="light">
                            Bug Report
                        </Button>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="sm:hidden">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button color="success" variant="flat" auto flat>
                                    <PiHamburger size={15} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Navbar Menu">
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/" variant="shadow">
                                        Features 🚨
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="success" href="add-student" variant="light">
                                        Contribute! 🚀
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="success" href="browse" variant="light">
                                        Browse
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/feature-request" variant="light">
                                        Feature Request
                                    </Button>
                                </DropdownItem>
                                <DropdownItem>
                                    <Button as={Link} color="default" href="/bug-report" variant="light">
                                        Bug Report
                                    </Button>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
        </div>
    );
}
